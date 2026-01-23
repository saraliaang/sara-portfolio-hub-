export type GestureType =
  | 'WAKE'
  | 'CONFIRM'
  | 'SCROLL_LEFT'
  | 'SCROLL_RIGHT'
  | 'SUMMON'
  | 'DISMISS'
  | null;

interface GestureResult {
  gesture: GestureType;
  cursor: { x: number; y: number };
  state: 'AWAKE' | 'ASLEEP';
  pinchProgress: number;
  debug: {
    pose: string;
    zDelta: number;
  };
}

export class GestureRecognizer {
  state: {
    isAwake: boolean;
    lastGesture: GestureType | null;
    lastGestureTime: number;
    lastHandPose: string;
    poseDuration: number;
    isPinching: boolean;
  };

  config: {
    wakeHoldTime: number;
    pinchThreshold: number;
    pinchReleaseThreshold: number;
    pinchHoldTime: number;
    scrollThresholdX: number;
    scaleThreshold: number;
    scaleTimeWindow: number;
    cooldown: number;
  };

  history: { x: number; y: number; z: number; scale: number; time: number; pose: string }[];
  maxHistoryTime: number;
  presenceStartTime: number;
  pinchStartTime: number;
  lastSummonTime: number;
  poseStartTime: number;

  constructor() {
    this.state = {
      isAwake: false,
      lastGesture: null,
      lastGestureTime: 0,
      lastHandPose: 'UNKNOWN',
      poseDuration: 0,
      isPinching: false,
    };

    this.config = {
      wakeHoldTime: 500,
      pinchThreshold: 0.1,
      pinchReleaseThreshold: 0.15,
      pinchHoldTime: 400,
      scrollThresholdX: 0.33,
      scaleThreshold: 0.04,
      scaleTimeWindow: 900,
      cooldown: 800,
    };

    this.history = [];
    this.maxHistoryTime = 1000;
    this.presenceStartTime = 0;
    this.pinchStartTime = 0;
    this.lastSummonTime = 0;
    this.poseStartTime = 0;
  }

  process(landmarks: { x: number; y: number; z: number }[] | null, timestamp: number): GestureResult | null {
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
    const currentScale = this._getHandScale(hand);

    this.history.push({
      x: palm.x,
      y: palm.y,
      z: palm.z,
      scale: currentScale,
      time: timestamp,
      pose: this._getHandPose(hand),
    });
    this.history = this.history.filter((h) => timestamp - h.time < this.maxHistoryTime);

    const result: GestureResult = {
      gesture: null,
      cursor: { x: indexTip.x, y: indexTip.y },
      state: this.state.isAwake ? 'AWAKE' : 'ASLEEP',
      pinchProgress: 0,
      debug: {
        pose: this._getHandPose(hand),
        zDelta: this._getScaleDelta(timestamp),
      },
    };

    const currentPose = this._getHandPose(hand);
    if (currentPose !== this.state.lastHandPose) {
      this.state.lastHandPose = currentPose;
      this.poseStartTime = timestamp;
    }

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

    const pinchDist = this._distance(thumbTip, indexTip);

    if (this.state.isPinching) {
      if (pinchDist > this.config.pinchReleaseThreshold) {
        this.state.isPinching = false;
        this.pinchStartTime = 0;
      }
    } else {
      if (pinchDist < this.config.pinchThreshold) {
        if (this.pinchStartTime === 0) this.pinchStartTime = timestamp;

        const elapsed = timestamp - this.pinchStartTime;
        if (elapsed > this.config.pinchHoldTime) {
          result.gesture = 'CONFIRM';
          this.state.lastGestureTime = timestamp;
          this.state.isPinching = true;
          return result;
        } else {
          result.pinchProgress = elapsed / this.config.pinchHoldTime;
        }
      } else {
        this.pinchStartTime = 0;
        result.pinchProgress = 0;
      }
    }

    if (currentPose === 'OPEN') {
      const cursorX = 1 - indexTip.x;
      const scroll = this._detectScroll(cursorX);
      if (scroll) {
        result.gesture = scroll;
        return result;
      }
    }

    if (timestamp - this.state.lastGestureTime > this.config.cooldown) {
      const scaleGesture = this._detectComplexScale(timestamp, currentPose);
      if (scaleGesture) {
        result.gesture = scaleGesture;
        this.state.lastGestureTime = timestamp;
        this.history = [];
        return result;
      }
    }

    return result;
  }

  _distance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  _getHandScale(hand: { x: number; y: number }[]) {
    return this._distance(hand[0], hand[9]);
  }

  _getHandPose(hand: { x: number; y: number }[]) {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const wrist = hand[0];

    let extendedCount = 0;
    for (let i = 0; i < 4; i++) {
      if (this._distance(hand[tips[i]], wrist) > this._distance(hand[pips[i]], wrist) * 1.1) {
        extendedCount++;
      }
    }

    let curledCount = 0;
    if (this._distance(hand[8], hand[0]) < this._distance(hand[6], hand[0]) * 1.2) curledCount++;
    if (this._distance(hand[12], hand[0]) < this._distance(hand[10], hand[0]) * 1.2) curledCount++;
    if (this._distance(hand[16], hand[0]) < this._distance(hand[14], hand[0]) * 1.2) curledCount++;
    if (this._distance(hand[20], hand[0]) < this._distance(hand[18], hand[0]) * 1.2) curledCount++;

    if (extendedCount >= 3) return 'OPEN';
    if (curledCount >= 3) return 'CLOSED';
    if (extendedCount <= 1) return 'CLOSED';

    return 'NEUTRAL';
  }

  _isSteady(timestamp: number) {
    if (this.history.length < 5) return false;
    const recent = this.history.slice(-5);
    const earliest = recent[0];
    const latest = recent[recent.length - 1];
    const dist = Math.sqrt(Math.pow(latest.x - earliest.x, 2) + Math.pow(latest.y - earliest.y, 2));
    return dist < 0.05;
  }

  _getScaleDelta(timestamp: number) {
    if (this.history.length < 5) return 0;
    const timeWindow = this.history.filter((h) => timestamp - h.time < this.config.scaleTimeWindow);
    if (timeWindow.length < 2) return 0;
    const start = timeWindow[0];
    const end = timeWindow[timeWindow.length - 1];
    return end.scale - start.scale;
  }

  _detectScroll(cursorX: number) {
    if (cursorX < this.config.scrollThresholdX) return 'SCROLL_LEFT';
    if (cursorX > 1 - this.config.scrollThresholdX) return 'SCROLL_RIGHT';
    return null;
  }

  _detectComplexScale(timestamp: number, currentPose: string) {
    const deltaScale = this._getScaleDelta(timestamp);

    if (deltaScale < -this.config.scaleThreshold && currentPose === 'CLOSED') {
      return 'SUMMON';
    }

    if (deltaScale > this.config.scaleThreshold && currentPose === 'OPEN') {
      return 'DISMISS';
    }

    return null;
  }
}
