export class OneEuroFilter {
    // Placeholder for future filtering; not used in this prototype.
}

export class LandmarkSmoother {
    constructor(alpha = 0.5) {
        // 0 = no change, 1 = instant. Lower = smoother but more lag.
        this.alpha = alpha;
        this.prevLandmarks = null;
    }

    smooth(landmarks) {
        // If no landmarks are provided, nothing to smooth.
        if (!landmarks) return null;
        if (!this.prevLandmarks) {
            // First frame: store and return raw landmarks.
            this.prevLandmarks = landmarks.map(p => ({...p}));
            return landmarks;
        }

        // Exponential smoothing for each landmark point.
        const smoothed = landmarks.map((point, index) => {
            const prev = this.prevLandmarks[index];
            const x = this._lerp(prev.x, point.x, this.alpha);
            const y = this._lerp(prev.y, point.y, this.alpha);
            const z = this._lerp(prev.z, point.z, this.alpha);
            return { x, y, z };
        });

        // Save smoothed landmarks for the next frame.
        this.prevLandmarks = smoothed;
        return smoothed;
    }

    _lerp(start, end, amt) {
        // Linear interpolation between previous and current values.
        return (1 - amt) * start + amt * end;
    }
}
