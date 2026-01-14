import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { GestureRecognizer } from "./gesture-logic.js";
import { UI } from "./ui.js";
import { LandmarkSmoother } from "./smoothing.js";

// Main DOM video element used as the input source for MediaPipe.
const video = document.getElementById("webcam");
// Webcam logic stays idle until Camera mode is enabled.
let handLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;
let cameraStream = null;
let modelLoading = false;
let activeMode = 'standard';

const gestureRecognizer = new GestureRecognizer();
const ui = new UI();
// Lower alpha = smoother (less jitter) but more latency.
const smoother = new LandmarkSmoother(0.2);

// Lazy-load the model only when camera mode is enabled.
// This avoids downloading WASM + model data on initial page load.
const createHandLandmarker = async () => {
  if (handLandmarker || modelLoading) return;
  modelLoading = true;
  try {
    // Load the MediaPipe vision runtime (WASM bundle).
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
    );
    // Create the hand model instance with the asset path.
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 1
    });
    console.log("Model loaded successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    modelLoading = false;
  }
};

// Feature detection for camera access.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

if (hasGetUserMedia()) {
  // Listen for camera UI toggle events (from UI module).
window.addEventListener('toggle-camera', (e) => {
    if (activeMode !== 'camera') return;
    if (e.detail.active) {
        resumeCamera();
    } else {
        pauseCamera();
    }
});
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Switch between Standard and Camera modes from the UI.
window.addEventListener('interaction-mode', async (e) => {
  const nextMode = e.detail.mode;
  activeMode = nextMode;
  if (nextMode === 'camera') {
    if (!hasGetUserMedia()) {
      console.warn("getUserMedia() is not supported by your browser");
      return;
    }
    // Load model (one-time) then start camera.
    await createHandLandmarker();
    resumeCamera();
  } else {
    // Stop camera + inference when leaving camera mode.
    stopCamera();
  }
});

function enableCam(event) {
  if (!handLandmarker) {
    console.log("Wait! ObjectDetector not loaded yet.");
    return;
  }

  // getUserMedia parameters.
  const constraints = {
    video: {
      width: 1280,
      height: 720
    }
  };

  // If we already have a stream, just reuse it.
  if (cameraStream) {
    video.srcObject = cameraStream;
    video.onloadeddata = predictWebcam;
    return;
  }

  // First-time camera request.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    cameraStream = stream;
    video.srcObject = stream;
    video.onloadeddata = predictWebcam;
  });
}

async function predictWebcam() {
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        // Use high-precision time for gesture detection windows.
        const now = performance.now();
        
        if (webcamRunning === true) {
            // Run MediaPipe for this video frame.
            const results = await handLandmarker.detectForVideo(video, now);

            // 1) Get raw landmarks
            // 2) Smooth them
            // 3) Interpret gestures and update UI
            if (results.landmarks && results.landmarks.length > 0) {
                const rawLandmarks = results.landmarks[0]; // First hand
                const smoothedLandmarks = smoother.smooth(rawLandmarks);
                
                // Process gestures with the current timestamp.
                const gestureResult = gestureRecognizer.process(smoothedLandmarks, now);
                
                ui.updateDebug(smoothedLandmarks, gestureResult, results);
            } else {
                // No hand detected in this frame.
                ui.updateDebug(null, null, results);
            }
        }
    }
    if (webcamRunning === true) {
        // Continue the inference loop on the next animation frame.
        window.requestAnimationFrame(predictWebcam);
    }
}

function resumeCamera() {
  if (!handLandmarker) return;
  if (webcamRunning) return;
  webcamRunning = true;
  enableCam();
}

function pauseCamera() {
  webcamRunning = false;
  // Keep stream alive but stop inference + clear debug canvas.
  ui.statsOverlay.innerText = "Camera Paused";
  ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
}

function stopCamera() {
  webcamRunning = false;
  if (cameraStream) {
    // Fully stop hardware capture to save power.
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  video.srcObject = null;
  // Full stop: no stream, no inference.
  ui.statsOverlay.innerText = "Camera Off";
  ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
}
