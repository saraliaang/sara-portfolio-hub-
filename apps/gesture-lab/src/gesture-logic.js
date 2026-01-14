export class GestureRecognizer {
  constructor() {
    // State holds current gesture context across frames.
    this.state = {
      isAwake: false,
      lastGesture: null,
      lastGestureTime: 0,
      lastHandPose: 'UNKNOWN', // OPEN, CLOSED
      poseDuration: 0,
      isPinching: false, // NEW: Track if we are currently holding a pinch
    };

    // Tunable thresholds for timing and distances.
    // These values control how sensitive the gestures feel.
    this.config = {
      wakeHoldTime: 500, // ms
      pinchThreshold: 0.1, 
      pinchReleaseThreshold: 0.15,
      pinchHoldTime: 400, 
      scrollThresholdX: 0.33, 
      scaleThreshold: 0.02, // NEW: Threshold for scale change (size change)
      scaleTimeWindow: 600, 
      cooldown: 500,
    };

    // Recent history for time-based gestures (scale change, steadiness).
    this.history = []; // Array of {x, y, z, scale, time}
    this.maxHistoryTime = 1000; // Keep last 1s

    // Internal timers for gesture states.
    this.presenceStartTime = 0;
    this.pinchStartTime = 0;
    this.lastSummonTime = 0;
    this.poseStartTime = 0;
  }

  process(landmarks, timestamp) {
    // If no hand is detected, reset state that depends on continuous tracking.
    if (!landmarks || landmarks.length === 0) {
      this.history = [];
      this.presenceStartTime = 0;
      this.state.lastHandPose = 'UNKNOWN';
      return null;
    }

    // MediaPipe returns 21 landmarks in a fixed order.
    // Index 0 is the wrist, 8 is index fingertip, 4 is thumb tip.
    const hand = landmarks; 
    const palm = hand[0];
    const indexTip = hand[8];
    const thumbTip = hand[4];

    // Track movement and scale over time for temporal gestures.
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

    // 1. Track pose changes for timing windows.
    const currentPose = this._getHandPose(hand);
    if (currentPose !== this.state.lastHandPose) {
        this.state.lastHandPose = currentPose;
        this.poseStartTime = timestamp;
    }

    // 2. Wake: open palm + steady for a short hold.
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
      // While asleep, we do not attempt other gestures.
      return result;
    }

    // --- Active Mode Gestures ---

    // 3. Confirm: pinch thumb + index and hold briefly.
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

    // 4. Edge scroll: move palm to left/right edges of the frame.
    // Only scroll when hand is OPEN to avoid accidental scrolls.
    if (currentPose === 'OPEN') {
        // Use the mirrored cursor position (index tip) for scroll so it matches what the user sees.
        const cursorX = 1 - indexTip.x;
        const scroll = this._detectScroll(cursorX);
        if (scroll) {
            result.gesture = scroll;
            return result;
        }
    }

    // 5. Summon/Dismiss: detect scale change (hand closer/farther).
    // Only check if we haven't gestured recently.
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
    // Euclidean distance in normalized coordinate space.
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
  
  _getHandScale(hand) {
      // Use wrist to middle MCP as a proxy for hand size/distance.
      return this._distance(hand[0], hand[9]);
  }

  _getHandPose(hand) {
    // Simple classifier: OPEN or CLOSED based on fingertip extension.
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const wrist = hand[0];
    const mcp = hand[9]; // Middle MCP - center of palm ish

    let extendedCount = 0;
    for (let i = 0; i < 4; i++) {
      // Tip further from wrist than PIP implies an extended finger.
      if (this._distance(hand[tips[i]], wrist) > this._distance(hand[pips[i]], wrist) * 1.1) {
        extendedCount++;
      }
    }

    // Check for curled fingers (fist-ish).
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
    // Check if palm movement is below a small threshold over a short window.
    if (this.history.length < 5) return false;
    const recent = this.history.slice(-5);
    const earliest = recent[0];
    const latest = recent[recent.length - 1];
    const dist = Math.sqrt(Math.pow(latest.x - earliest.x, 2) + Math.pow(latest.y - earliest.y, 2));
    return dist < 0.05;
  }

  _getScaleDelta(timestamp) {
     if (this.history.length < 5) return 0;
     // Look at hand scale change within a short time window.
     const timeWindow = this.history.filter(h => timestamp - h.time < this.config.scaleTimeWindow);
     if (timeWindow.length < 2) return 0;
     const start = timeWindow[0];
     const end = timeWindow[timeWindow.length - 1];
     return end.scale - start.scale;
  }

  _detectScroll(cursorX) {
    // If the cursor is near the left or right edge, trigger scroll.
    if (cursorX < this.config.scrollThresholdX) return 'SCROLL_LEFT'; 
    if (cursorX > (1 - this.config.scrollThresholdX)) return 'SCROLL_RIGHT';
    return null;
  }

  _detectComplexScale(timestamp, currentPose) {
     const deltaScale = this._getScaleDelta(timestamp);
     
    // SUMMON: pull back (hand appears smaller) with a closed hand.
     if (deltaScale < -this.config.scaleThreshold && currentPose === 'CLOSED') {
         return 'SUMMON';
     }

    // DISMISS: push forward (hand appears bigger) with an open hand.
     if (deltaScale > this.config.scaleThreshold && currentPose === 'OPEN') {
        return 'DISMISS';
     }

     return null;
  }
}
