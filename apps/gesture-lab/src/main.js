import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { GestureRecognizer } from "./gesture-logic.js";
import { UI } from "./ui.js";
import { LandmarkSmoother } from "./smoothing.js";

const video = document.getElementById("webcam");
// Auto-start webcam logic instead of button
let handLandmarker = undefined;
let webcamRunning = true; // Auto start
let lastVideoTime = -1;

const gestureRecognizer = new GestureRecognizer();
const ui = new UI();
const smoother = new LandmarkSmoother(0.2); // 0.2 = heavy smoothing. Adjust as needed.

// Initialize MediaPipe HandLandmarker
const createHandLandmarker = async () => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 1
    });
    console.log("Model loaded successfully!");
    // Auto start cam once model loaded
    enableCam();
  } catch (error) {
    console.error(error);
  }
};

createHandLandmarker();

// Check if webcam access is supported
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

if (hasGetUserMedia()) {
  // enableWebcamButton.// Camera Toggle Logic
window.addEventListener('toggle-camera', (e) => {
    if (e.detail.active) {
        if (!webcamRunning) {
             webcamRunning = true;
             window.requestAnimationFrame(predictWebcam);
        }
    } else {
        webcamRunning = false;
        ui.statsOverlay.innerText = "Camera Paused";
        ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    }
});

// Start detection
if (hasGetUserMedia()) {
    enableCam();
} else {
    console.warn("getUserMedia() is not supported by your browser");
}
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

function enableCam(event) {
  if (!handLandmarker) {
    console.log("Wait! ObjectDetector not loaded yet.");
    return;
  }

  // getUsermedia parameters.
  const constraints = {
    video: {
      width: 1280,
      height: 720
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

async function predictWebcam() {
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        // Use performance.now() for high-precision, smooth timestamps
        const now = performance.now();
        
        if (webcamRunning === true) {
            // Detect
            const results = await handLandmarker.detectForVideo(video, now); // Changed to handLandmarker.detectForVideo
            
            // Pass to our custom logic (with smoothing inside usually, but we do it manually before?)
            // Wait, current logic:
            // 1. Get raw landmarks
            // 2. Smooth them
            // 3. Process gestures
            
            // recognizeForVideo returns 'results'.
            if (results.landmarks && results.landmarks.length > 0) {
                const rawLandmarks = results.landmarks[0]; // First hand
                const smoothedLandmarks = smoother.smooth(rawLandmarks);
                
                // Process gestures with high-res timestamp
                const gestureResult = gestureRecognizer.process(smoothedLandmarks, now); // Changed to gestureRecognizer
                
                ui.updateDebug(smoothedLandmarks, gestureResult, results);
            } else {
                ui.updateDebug(null, null, results);
            }
        }
    }
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
