export class GestureRecognizer {
  constructor() {
    this.state = {
      isAwake: false,
      lastGesture: null,
      lastGestureTime: 0,
      lastHandPose: 'UNKNOWN', // OPEN, CLOSED
      poseDuration: 0,
      isPinching: false, // NEW: Track if we are currently holding a pinch
    };

    // Configuration thresholds
    this.config = {
      wakeHoldTime: 500, // ms
      pinchThreshold: 0.1, 
      pinchReleaseThreshold: 0.15,
      pinchHoldTime: 400, 
      scrollThresholdX: 0.25, 
      scaleThreshold: 0.02, // NEW: Threshold for scale change (size change)
      scaleTimeWindow: 600, 
      cooldown: 500,
    };

    // History for temporal gestures
    this.history = []; // Array of {x, y, z, scale, time}
    this.maxHistoryTime = 1000; // Keep last 1s

    // Gesture-specific state tracking
    this.presenceStartTime = 0;
    this.pinchStartTime = 0;
    this.lastSummonTime = 0;
    this.poseStartTime = 0;
  }

  process(landmarks, timestamp) {
    if (!landmarks || landmarks.length === 0) {
      this.history = [];
      this.presenceStartTime = 0;
      this.state.lastHandPose = 'UNKNOWN';
      return null;
    }

    const hand = landmarks; 
    const palm = hand[0];
    const indexTip = hand[8];
    const thumbTip = hand[4];

    // Add to history
    const currentScale = this._getHandScale(hand); // Calculate Scale (Size)
    
    this.history.push({
      x: palm.x,
      y: palm.y,
      z: palm.z,
      scale: currentScale,
      time: timestamp,
      pose: this._getHandPose(hand), // Track pose over time
    });
    this.history = this.history.filter((h) => timestamp - h.time < this.maxHistoryTime);

    const result = {
      gesture: null,
      cursor: { x: indexTip.x, y: indexTip.y },
      state: this.state.isAwake ? 'AWAKE' : 'ASLEEP',
      debug: {
        pose: this._getHandPose(hand),
        zDelta: this._getScaleDelta(timestamp) 
      }
    };
    
    // Default progress
    result.pinchProgress = 0;

    // 1. Check Hand Pose Update
    const currentPose = this._getHandPose(hand);
    if (currentPose !== this.state.lastHandPose) {
        this.state.lastHandPose = currentPose;
        this.poseStartTime = timestamp;
    }

    // 2. Check for Wake (Open Palm Steady)
    if (!this.state.isAwake) {
      if (currentPose === 'OPEN' && this._isSteady(timestamp)) {
        if (this.presenceStartTime === 0) this.presenceStartTime = timestamp;
        if (timestamp - this.presenceStartTime > this.config.wakeHoldTime) {
           this.state.isAwake = true;
           result.gesture = 'WAKE';
           result.state = 'AWAKE';
           this.presenceStartTime = 0;
        }
      } else {
        this.presenceStartTime = 0;
      }
      return result;
    }

    // --- Active Mode Gestures ---

    // 3. Enter / Confirm (Pinch)
    const pinchDist = this._distance(thumbTip, indexTip);
    
    // State Machine for Pinch
    if (this.state.isPinching) {
        // We are already pinching. Wait for release.
        if (pinchDist > this.config.pinchReleaseThreshold) {
            this.state.isPinching = false;
            this.pinchStartTime = 0;
        }
    } else {
        // Not pinching. Check for new pinch.
        if (pinchDist < this.config.pinchThreshold) {
            if (this.pinchStartTime === 0) this.pinchStartTime = timestamp;
            
            const elapsed = timestamp - this.pinchStartTime;
            if (elapsed > this.config.pinchHoldTime) {
                // Trigger!
                result.gesture = 'CONFIRM';
                this.state.lastGestureTime = timestamp;
                this.state.isPinching = true; // Lock it
                return result; 
            } else {
                // Holding... return progress
                result.pinchProgress = elapsed / this.config.pinchHoldTime;
            }
        } else {
            this.pinchStartTime = 0;
            result.pinchProgress = 0;
        }
    }

    // 4. Joystick / Edge Scroll
    // Only scroll if hand is OPEN (don't scroll while trying to pinch or summon)
    // Also block if we are "holding" a pinched state (dragging?) - optional
    if (currentPose === 'OPEN') {
        const scroll = this._detectScroll(palm);
        if (scroll) {
            result.gesture = scroll;
            return result;
        }
    }

    // 5. Summon / Dismiss (Complex Physics - Scale Based)
    // Only check if we haven't gestured recently
    if (timestamp - this.state.lastGestureTime > this.config.cooldown) {
       const scaleGesture = this._detectComplexScale(timestamp, currentPose);
       if (scaleGesture) {
         result.gesture = scaleGesture;
         this.state.lastGestureTime = timestamp; // Cooldown
         this.history = []; // Reset history
         return result;
       }
    }

    return result;
  }

  // --- Helpers ---

  _distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
  
  _getHandScale(hand) {
      // Use distance between Wrist (0) and Middle MCP (9) as a stable proxy for hand size/distance
      return this._distance(hand[0], hand[9]);
  }

  _getHandPose(hand) {
    // Simple classifier: OPEN or CLOSED
    // OPEN: Tips further from wrist than PIPs
    // CLOSED: Tips close to Palm/MCPs
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const wrist = hand[0];
    const mcp = hand[9]; // Middle MCP - center of palm ish

    let extendedCount = 0;
    for (let i = 0; i < 4; i++) {
      // Check distance from wrist: Tip > PIP * 1.1 means extended
      if (this._distance(hand[tips[i]], wrist) > this._distance(hand[pips[i]], wrist) * 1.1) {
        extendedCount++;
      }
    }

    // Check for Salt Pinch (Fist/Bunches fingers)
    // Relaxed Check: < 2 extended fingers (Thumb doesn't count)
    // Actually, improved check: Tips close to Palm Center (MCPs 9/13)
    let curledCount = 0;
    // Check Index(8), Middle(12), Ring(16), Pinky(20)
    // against their PIPs (6, 10, 14, 18)
    if (this._distance(hand[8], hand[0]) < this._distance(hand[6], hand[0]) * 1.2) curledCount++;
    if (this._distance(hand[12], hand[0]) < this._distance(hand[10], hand[0]) * 1.2) curledCount++;
    if (this._distance(hand[16], hand[0]) < this._distance(hand[14], hand[0]) * 1.2) curledCount++;
    if (this._distance(hand[20], hand[0]) < this._distance(hand[18], hand[0]) * 1.2) curledCount++;

    if (extendedCount >= 3) return 'OPEN';
    if (curledCount >= 3) return 'CLOSED'; // At least 3 fingers curled
    if (extendedCount <= 1) return 'CLOSED'; // Fallback
    
    return 'NEUTRAL'; // In between
  }

  _isSteady(timestamp) {
    if (this.history.length < 5) return false;
    const recent = this.history.slice(-5);
    const earliest = recent[0];
    const latest = recent[recent.length - 1];
    const dist = Math.sqrt(Math.pow(latest.x - earliest.x, 2) + Math.pow(latest.y - earliest.y, 2));
    return dist < 0.05;
  }

  _getScaleDelta(timestamp) {
     if (this.history.length < 5) return 0;
     const timeWindow = this.history.filter(h => timestamp - h.time < this.config.scaleTimeWindow);
     if (timeWindow.length < 2) return 0;
     const start = timeWindow[0];
     const end = timeWindow[timeWindow.length - 1];
     return end.scale - start.scale;
  }

  _detectScroll(palm) {
    if (palm.x < this.config.scrollThresholdX) return 'SCROLL_RIGHT'; 
    if (palm.x > (1 - this.config.scrollThresholdX)) return 'SCROLL_LEFT';
    return null;
  }

  _detectComplexScale(timestamp, currentPose) {
     const deltaScale = this._getScaleDelta(timestamp);
     
     // SUMMON: Pull Back (Move Away) -> Hand Scaler Gets SMALLER (deltaScale is Negative)
     // User requirement: "Salt Pinch" + Pull
     // "Pull Back": moving away from camera.
     if (deltaScale < -this.config.scaleThreshold && currentPose === 'CLOSED') {
         return 'SUMMON';
     }

     // DISMISS: Push Forward (Move Close) -> Hand Scale Gets BIGGER (deltaScale is Positive)
     // User requirement: "Throw" (Open) + Push
     if (deltaScale > this.config.scaleThreshold && currentPose === 'OPEN') {
        return 'DISMISS';
     }

     return null;
  }
}
