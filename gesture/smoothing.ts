export class LandmarkSmoother {
  alpha: number;
  smoothed: { x: number; y: number; z: number }[] | null;

  constructor(alpha = 0.2) {
    this.alpha = alpha;
    this.smoothed = null;
  }

  smooth(landmarks: { x: number; y: number; z: number }[]) {
    if (!this.smoothed || this.smoothed.length !== landmarks.length) {
      this.smoothed = landmarks.map((lm) => ({ ...lm }));
      return this.smoothed;
    }

    this.smoothed = this.smoothed.map((prev, i) => {
      const cur = landmarks[i];
      return {
        x: prev.x + this.alpha * (cur.x - prev.x),
        y: prev.y + this.alpha * (cur.y - prev.y),
        z: prev.z + this.alpha * (cur.z - prev.z),
      };
    });

    return this.smoothed;
  }
}
