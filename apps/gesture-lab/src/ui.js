export class UI {
    constructor() {
        this.canvas = document.getElementById('output_canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cursor = document.getElementById('cursor');
        this.statusPill = document.getElementById('status_pill');
        this.statsOverlay = document.getElementById('stats_overlay');
        this.scrollContainer = document.getElementById('galaxy-scroll-container');
        this.detailModal = document.getElementById('detail-modal');
        this.memoryModal = document.getElementById('memory-modal');
        this.modalOpen = false;
        
        
        // Clone items for infinite scroll illusion
        this.initInfiniteScroll();
        this.initKeyboardControls();
        this.initCameraToggle();
    }

    initCameraToggle() {
        const btn = document.getElementById('camera-toggle');
        const pip = document.getElementById('camera-pip');
        let isHidden = false;
        
        btn.addEventListener('click', () => {
            isHidden = !isHidden;
            if (isHidden) {
                pip.classList.add('camera-hidden');
                btn.innerText = '🚫';
                btn.style.opacity = '0.5';
                // Note: We are just hiding the UI, not stopping the stream completely 
                // to avoid re-init complexity for this prototype. 
                // But user asked to "switch it off". 
                // Let's emit an event or callback if we wanted to stop the stream, 
                // but just hiding the view is often what is meant by "get it out of the way".
                // If they mean "stop processing", we'd need to pause the requestAnimationFrame loop in main.js.
                // Let's dispatch a custom event on window logic.
                window.dispatchEvent(new CustomEvent('toggle-camera', { detail: { active: !isHidden } }));
            } else {
                pip.classList.remove('camera-hidden');
                btn.innerText = '📷';
                btn.style.opacity = '1';
                window.dispatchEvent(new CustomEvent('toggle-camera', { detail: { active: !isHidden } }));
            }
        });
    }

    initKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Mapping keys to gestures
            // Arrow Left/Right -> Scroll
            // Space/Enter -> Confirm/Click (on center item?) OR just generic 'CONFIRM' 
            // Escape -> Dismiss
            // M -> Summon Memory
            
            if (this.modalOpen) {
                if (e.key === 'Escape') {
                    this.handleInteraction({ gesture: 'DISMISS' });
                }
                return;
            }

            switch(e.key) {
                case 'ArrowRight':
                    this.handleInteraction({ gesture: 'SCROLL_RIGHT' });
                    break;
                case 'ArrowLeft':
                    this.handleInteraction({ gesture: 'SCROLL_LEFT' });
                    break;
                case 'Enter': 
                case ' ':
                    // For keyboard click, we need a "focused" card. 
                    // Let's assume the center-most card is "focused" or just click the first hovered one?
                    // Without a cursor, we can't hover. 
                    // Let's "Activate" the card in the center of the screen.
                    this.clickCenterCard();
                    break;
                case 'm':
                case 'M':
                    this.handleInteraction({ gesture: 'SUMMON' });
                    break;
            }
        });
    }

    clickCenterCard() {
         const container = this.scrollContainer;
         const center = container.scrollLeft + (container.clientWidth / 2);
         // Find card closest to center
         const cards = document.querySelectorAll('.galaxy-card');
         let closest = null;
         let minDist = Infinity;
         
         cards.forEach(card => {
             const rect = card.getBoundingClientRect();
             // We need relative pos within container
             const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
             const dist = Math.abs(cardCenter - center);
             if (dist < minDist) {
                 minDist = dist;
                 closest = card;
             }
         });
         
         if (closest) {
             this.triggerClick(closest);
         }
    }

    updateStats(results, pose, zDelta) {
        if (!results || !results.handedness || results.handedness.length === 0) {
            this.statsOverlay.innerHTML = 'No Hand Detected';
            return;
        }

        const handedness = results.handedness[0][0];
        const score = Math.round(handedness.score * 100);
        
        let html = `<div>${handedness.categoryName} (${score}%)</div>`;
        html += `<div>Pose: ${pose || 'N/A'}</div>`;
        html += `<div>dScale: ${zDelta ? (zDelta * 100).toFixed(2) : '0'}</div>`;
        
        this.statsOverlay.innerHTML = html;
    }

    initInfiniteScroll() {
        const list = document.getElementById('galaxy-list');
        // Simple infinite scroll: 
        // We aren't really doing a seamless loop logic here because it's complex for a vanilla prototype.
        // Instead: standard scroll.
        // User requested: "Infinite loop from left to right".
        // Let's duplicate the content x3.
        const originalContent = list.innerHTML;
        list.innerHTML = originalContent + originalContent + originalContent;
        
        // Scroll to middle set
        setTimeout(() => {
             this.scrollContainer.scrollLeft = list.scrollWidth / 3;
        }, 100);
    }

    resize() {
        // We match resolution of video usually, or container.
        // Let's stick to intrinsic video size or just keep it simple.
        this.canvas.width = 1280; 
        this.canvas.height = 720;
    }

    updateDebug(landmarks, gestureResult, rawMedipipeResults) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update raw stats text
        let pose = 'UNKNOWN';
        let zDelta = 0;
        
        if (gestureResult && gestureResult.debug) {
            pose = gestureResult.debug.pose;
            zDelta = gestureResult.debug.zDelta;
        }

        this.updateStats(rawMedipipeResults, pose, zDelta);

        if (landmarks) {
            this.drawLandmarks(landmarks);
            this.statusPill.innerText = "System Active";
            this.statusPill.style.color = "#00e5ff"; // Neon Cyan
        } else {
            this.statusPill.innerText = "Scanning...";
            this.statusPill.style.color = "#aaa";
            this.cursor.style.opacity = 0;
            return;
        }

        if (gestureResult) {
            // Update Cursor Position
            this.updateCursor(gestureResult.cursor);
            
            // Handle Interaction State
            this.handleInteraction(gestureResult);
        }
    }

    updateCursor(cursorPos) {
        if (!cursorPos) return;
        this.cursor.style.opacity = 1;

        // Map normalized coords (0-1) to screen pixels
        // Mirroring logic: x = (1 - x)
        const x = (1 - cursorPos.x) * window.innerWidth;
        const y = cursorPos.y * window.innerHeight;
        
        this.cursor.style.left = `${x}px`;
        this.cursor.style.top = `${y}px`;

        // Save current screen coords for hit testing
        this.cursorScreenX = x;
        this.cursorScreenY = y;
    }
    
    updateCursorVisuals(progress, isClicking) {
        if (isClicking) {
            this.cursor.classList.add('clicking');
            this.cursor.style.setProperty('--pinch-progress', '1');
        } else {
            this.cursor.classList.remove('clicking');
            // Update progress visual (scale or border)
            // We'll use a CSS variable to drive a conic gradient or scale
            this.cursor.style.setProperty('--pinch-progress', progress.toFixed(2));
            
            if (progress > 0) {
                 this.cursor.classList.add('loading');
            } else {
                 this.cursor.classList.remove('loading');
            }
        }
    }

    handleInteraction(result) {
        const { gesture, state } = result;

        // 0. Global Modals (Summon/Dismiss)
        if (gesture === 'DISMISS' && this.modalOpen) {
            this.closeModals();
            this.statusPill.innerText = "Dismissed!";
            return;
        }

        if (gesture === 'SUMMON' && !this.modalOpen) {
            this.openMemoryModal();
            this.statusPill.innerText = "Summoned Memory!";
            return;
        }

        if (this.modalOpen) return; // Block interaction if modal is open

        // 1. Scroll Logic
        if (gesture === 'SCROLL_LEFT') {
            this.scrollContainer.scrollBy({ left: -15, behavior: 'instant' }); 
            this.statusPill.innerText = "<< Scrolling Left";
            this.checkInfiniteLoop();
        } else if (gesture === 'SCROLL_RIGHT') {
            this.scrollContainer.scrollBy({ left: 15, behavior: 'instant' }); 
            this.statusPill.innerText = "Scrolling Right >>";
            this.checkInfiniteLoop();
        }

        // 2. Hover Logic
        // Perform hit test at cursor position
        const element = document.elementFromPoint(this.cursorScreenX, this.cursorScreenY);
        
        // Remove old hovers
        document.querySelectorAll('.galaxy-card.hovered').forEach(el => el.classList.remove('hovered'));

        if (element) {
            const card = element.closest('.galaxy-card');
            if (card) {
                card.classList.add('hovered');
                
                // 3. Click Logic (Pinch to Confirm)
                if (gesture === 'CONFIRM') {
                    this.triggerClick(card);
                }
            }
        }
        
        if (gesture === 'CONFIRM') {
            // handled by isClicking logic below mostly, but for text update:
            this.statusPill.innerText = "Selection Active";
            this.statusPill.style.color = "#ffff00"; // Yellow
        }
        
        // Update Cursor Visuals
        const progress = result.pinchProgress || 0;
        const isClicking = (gesture === 'CONFIRM');
        this.updateCursorVisuals(progress, isClicking);
    }

    checkInfiniteLoop() {
        const container = this.scrollContainer;
        const totalWidth = container.scrollWidth;
        const viewWidth = container.clientWidth;
        
        // If near left end, jump to middle
        if (container.scrollLeft < 100) {
            container.scrollLeft = (totalWidth / 3) + 100;
        }
        // If near right end, jump to middle
        else if (container.scrollLeft > (totalWidth * 2 / 3) + viewWidth) {
             container.scrollLeft = (totalWidth / 3);
        }
    }

    triggerClick(card) {
        if (this.modalOpen) return;
        
        const title = card.querySelector('h2').innerText;
        const desc = card.querySelector('p').innerText;
        this.openDetailModal(title, desc);
    }
    
    openDetailModal(title, desc) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-desc').innerText = desc;
        this.detailModal.classList.remove('hidden');
        this.modalOpen = true;
    }
    
    openMemoryModal() {
        this.memoryModal.classList.remove('hidden');
        this.modalOpen = true;
    }
    
    closeModals() {
        this.detailModal.classList.add('hidden');
        this.memoryModal.classList.add('hidden');
        this.modalOpen = false;
    }

    drawLandmarks(landmarks) {
        this.ctx.save();
        this.ctx.strokeStyle = '#00e5ff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        // Simplified raw drawing for the PIP view
        const connections = [[0,1,2,3,4],[0,5,6,7,8],[0,9,10,11,12],[0,13,14,15,16],[0,17,18,19,20],[0,5],[5,9],[9,13],[13,17],[0,17]];
        
        connections.forEach(string => {
            this.ctx.beginPath();
            for (let i = 0; i < string.length - 1; i++) {
                const start = landmarks[string[i]];
                const end = landmarks[string[i+1]];
                this.ctx.moveTo(start.x * this.canvas.width, start.y * this.canvas.height);
                this.ctx.lineTo(end.x * this.canvas.width, end.y * this.canvas.height);
            }
            this.ctx.stroke();
        });
        this.ctx.restore();
    }
}
