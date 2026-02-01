import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GestureRecognizer, GestureType } from '../gesture/gesture-logic';
import { LandmarkSmoother } from '../gesture/smoothing';

interface GestureControllerProps {
  enabled: boolean;
  onCursor: (position: { x: number; y: number } | null) => void;
  onGesture: (gesture: GestureType) => void;
}

export const GestureController: React.FC<GestureControllerProps> = ({
  enabled,
  onCursor,
  onGesture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const [statusText, setStatusText] = useState('Camera Off');
  const [gestureText, setGestureText] = useState('Gesture: --');

  const recognizerRef = useRef(new GestureRecognizer());
  const smootherRef = useRef(new LandmarkSmoother(0.2));
  const loadingRef = useRef(false);

  const stopLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const stopCamera = () => {
    stopLoop();
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onCursor(null);
    setStatusText('Camera Off');
  };

  const drawLandmarks = (landmarks: { x: number; y: number }[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.35, '#e2e8f0');
    gradient.addColorStop(0.7, '#94a3b8');
    gradient.addColorStop(1, '#64748b');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(226,232,240,0.5)';
    ctx.shadowBlur = 8;
    const connections = [
      [0, 1, 2, 3, 4],
      [0, 5, 6, 7, 8],
      [0, 9, 10, 11, 12],
      [0, 13, 14, 15, 16],
      [0, 17, 18, 19, 20],
      [0, 5],
      [5, 9],
      [9, 13],
      [13, 17],
      [0, 17],
    ];
    connections.forEach((path) => {
      ctx.beginPath();
      for (let i = 0; i < path.length - 1; i++) {
        const start = landmarks[path[i]];
        const end = landmarks[path[i + 1]];
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
      }
      ctx.stroke();
    });

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 2;
    connections.forEach((path) => {
      ctx.beginPath();
      for (let i = 0; i < path.length - 1; i++) {
        const start = landmarks[path[i]];
        const end = landmarks[path[i + 1]];
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
      }
      ctx.stroke();
    });
    ctx.restore();

    const knuckles = [5, 6, 9, 10, 13, 14, 17, 18];
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 10;
    knuckles.forEach((index) => {
      const point = landmarks[index];
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  const ensureModel = async () => {
    if (handLandmarkerRef.current || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });
    } finally {
      loadingRef.current = false;
    }
  };

  const predict = async () => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;
    if (!video || !handLandmarker) return;

    if (lastVideoTimeRef.current !== video.currentTime) {
      lastVideoTimeRef.current = video.currentTime;
      const now = performance.now();
      const results = await handLandmarker.detectForVideo(video, now);
      if (results.landmarks && results.landmarks.length > 0) {
        const rawLandmarks = results.landmarks[0];
        const smoothed = smootherRef.current.smooth(rawLandmarks);
        const gestureResult = recognizerRef.current.process(smoothed, now);
        setStatusText('System Active');

        if (gestureResult) {
          const handedness = (results as any)?.handedness?.[0]?.[0]?.categoryName;
          const handOffset = handedness === 'Right' ? 0.04 : handedness === 'Left' ? -0.04 : 0;
          const gain = 1.12; 
          const cx = (1 - gestureResult.cursor.x + handOffset) - 0.5;
          const cy = gestureResult.cursor.y - 0.2;
          const cursor = {
            x: (cx * gain + 0.5) * window.innerWidth,
            y: (cy * gain + 0.5) * window.innerHeight,
          };
          onCursor(cursor);
          if (gestureResult.gesture) {
            setGestureText(`Gesture: ${gestureResult.gesture}`);
            onGesture(gestureResult.gesture);
          }
        }
        drawLandmarks(smoothed);
      } else {
        setStatusText('Scanning...');
        setGestureText('Gesture: --');
        onCursor(null);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }

    rafRef.current = requestAnimationFrame(predict);
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    if (cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.onloadeddata = () => {
        predict();
      };
      return;
    }
    const constraints = { video: { width: 1280, height: 720 } };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraStreamRef.current = stream;
    videoRef.current.srcObject = stream;
    videoRef.current.onloadeddata = () => {
      predict();
    };
  };

  useEffect(() => {
    if (!enabled) {
      stopCamera();
      return;
    }
    let isActive = true;
    (async () => {
      await ensureModel();
      if (!isActive) return;
      setStatusText('Starting...');
      await startCamera();
    })();
    return () => {
      isActive = false;
      stopCamera();
    };
  }, [enabled]);

  return (
    <div className="relative w-[240px] sm:w-[280px] bg-black/70 border border-white/10 rounded-md overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-90 -scale-x-100"
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="absolute inset-0 w-full h-full -scale-x-100"
        />
        <div className="absolute bottom-2 left-2 text-[10px] font-tech uppercase tracking-widest text-white/70">
          <div className="text-[#22d3ee]">Gesture: {gestureText.replace('Gesture: ', '')}</div>
          {statusText}
        </div>
      </div>
    </div>
  );
};
