# Hand Gesture Playground

A simple, interactive website for testing and refining hand gestures using MediaPipe Hand Landmarker.

## Features

- **Real-time Hand Tracking**: Uses MediaPipe Tasks Vision.
- **6 Custom Gestures**:
  1.  **Wake / Presence**: Hold open palm steady (~0.5s).
  2.  **Swipe Left / Right**: Move open palm laterally.
  3.  **Confirm**: Pinch (thumb + index) and hold (~0.3s).
  4.  **Summon**: Pull open palm towards camera.
  5.  **Dismiss**: Push open palm away from camera.
  6.  **Exit**: Make a steady fist.
- **Visual Feedback**:
  - Skeleton overlay.
  - Cursor tracking (Index finger tip).
  - Status log and visual indicators.

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- A webcam

### Installation

1.  Clone the repository (if applicable) or navigate to the project folder.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to the URL shown (usually `http://localhost:5173`).
3.  Click **"Enable Webcam"** (or "Enable Predictions") to start.
4.  Allow camera access when prompted.

## Usage Guide

- **Cursor**: The glowing comet follows your index finger tip.
- **Wake**: The system starts in a "Waiting" state. Hold your hand up, open palm, and keep it steady to "Wake" the system.
- **Interaction**: Once awake, you can perform swipes, pinches, etc.
- **Logs**: Check the sidebar for a history of detected gestures.

## Troubleshooting

- **Camera not working**: Ensure no other app is using the camera. Check browser permissions.
- **Gestures not triggering**:
  - Ensure good lighting.
  - Keep your hand within the frame.
  - Try adjusting the distance from the camera.
  - "Wake" the system first (Steady Open Palm).

## Tech Stack

- Vite
- Vanilla JavaScript
- MediaPipe Tasks Vision
