export class OneEuroFilter {
    // Simple exponential smoothing for now. 
    // "OneEuroFilter" is a standard name but let's stick to simple Lerp first as it's easier to tune.
    // If user wants "Studio" quality, strict Lerp might lag.
    // Let's implement a simple damped oscillator or just adjustable Lerp.
}

export class LandmarkSmoother {
    constructor(alpha = 0.5) {
        this.alpha = alpha; // 0 = no change, 1 = instant. Lower = smoother but more lag.
        this.prevLandmarks = null;
    }

    smooth(landmarks) {
        if (!landmarks) return null;
        if (!this.prevLandmarks) {
            this.prevLandmarks = landmarks.map(p => ({...p}));
            return landmarks;
        }

        const smoothed = landmarks.map((point, index) => {
            const prev = this.prevLandmarks[index];
            const x = this._lerp(prev.x, point.x, this.alpha);
            const y = this._lerp(prev.y, point.y, this.alpha);
            const z = this._lerp(prev.z, point.z, this.alpha);
            return { x, y, z };
        });

        this.prevLandmarks = smoothed;
        return smoothed;
    }

    _lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
}
