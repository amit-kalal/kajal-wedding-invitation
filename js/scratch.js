/**
 * ==============================================================================
 * INTERACTIVE GOLD FOIL SCRATCH CARD SYSTEM
 * ==============================================================================
 * Enables guests to scratch off shimmering gold foil cards using their finger
 * (touch) or mouse to reveal the auspicious wedding date: 18 - Dec - 2026.
 * ==============================================================================
 */

const ScratchCards = (function () {
  const cards = [];

  class ScratchCard {
    constructor(canvasElement, boxElement) {
      this.canvas = canvasElement;
      this.box = boxElement;
      this.ctx = this.canvas.getContext('2d');
      this.isDrawing = false;
      this.isRevealed = false;
      this.scratchedPixels = 0;
      this.totalPixels = 0;

      this.init();
    }

    init() {
      // Set precise canvas dimensions matching the card box
      const rect = this.box.getBoundingClientRect();
      this.width = this.canvas.width = rect.width > 20 ? rect.width : 105;
      this.height = this.canvas.height = rect.height > 20 ? rect.height : 125;
      this.totalPixels = this.width * this.height;

      this.paintGoldFoil();
      this.bindEvents();
    }

    paintGoldFoil() {
      const ctx = this.ctx;
      ctx.globalCompositeOperation = 'source-over';

      // Shimmering Metallic Gold Foil Gradient
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(0, '#f9e8a2');
      grad.addColorStop(0.25, '#d4af37');
      grad.addColorStop(0.5, '#aa771c');
      grad.addColorStop(0.75, '#f5e38d');
      grad.addColorStop(1, '#8a5a00');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Fine golden speckles / glitter texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Ornate Border on Foil
      ctx.strokeStyle = '#fff5cc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, 4, this.width - 8, this.height - 8);

      // "SCRATCH" Text Prompt
      ctx.font = '600 10px Montserrat, sans-serif';
      ctx.fillStyle = '#4a2d02';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';
      ctx.fillText('✨ SCRATCH ✨', this.width / 2, this.height / 2);
    }

    bindEvents() {
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const start = (e) => {
        if (this.isRevealed) return;
        this.isDrawing = true;
        const pos = getPos(e);
        this.scratch(pos.x, pos.y);
      };

      const move = (e) => {
        if (!this.isDrawing || this.isRevealed) return;
        e.preventDefault(); // Prevent page scroll while scratching
        const pos = getPos(e);
        this.scratch(pos.x, pos.y);
      };

      const stop = () => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.checkRevealPercentage();
      };

      // Mouse Events
      this.canvas.addEventListener('mousedown', start);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', stop);

      // Touch Events
      this.canvas.addEventListener('touchstart', start, { passive: false });
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', stop);
    }

    scratch(x, y) {
      const ctx = this.ctx;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      // Generous circular eraser
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    checkRevealPercentage() {
      if (this.isRevealed) return;
      try {
        const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
        let clearPixels = 0;
        const step = 4 * 16; // Sample every 16th pixel for high performance

        for (let i = 3; i < imgData.data.length; i += step) {
          if (imgData.data[i] === 0) {
            clearPixels++;
          }
        }

        const sampledTotal = imgData.data.length / step;
        const percent = (clearPixels / sampledTotal) * 100;

        // If 40% is scratched, smoothly reveal the remainder
        if (percent > 40) {
          this.revealFully();
        }
      } catch (err) {
        // Fallback
      }
    }

    revealFully() {
      if (this.isRevealed) return;
      this.isRevealed = true;
      this.canvas.style.opacity = '0';
      setTimeout(() => {
        this.canvas.style.display = 'none';
      }, 500);
    }
  }

  function init() {
    const cardBoxes = document.querySelectorAll('.scratch-card-box');
    cardBoxes.forEach((box) => {
      const canvas = box.querySelector('.scratch-canvas');
      if (canvas) {
        cards.push(new ScratchCard(canvas, box));
      }
    });

    // Helper button to reveal all at once
    const revealAllBtn = document.getElementById('btnRevealAllDate');
    if (revealAllBtn) {
      revealAllBtn.addEventListener('click', () => {
        cards.forEach((c) => c.revealFully());
      });
    }
    window.addEventListener('doorsOpened', () => {
      cards.forEach((c) => {
        const rect = c.box.getBoundingClientRect();
        if (rect.width > 20 && Math.abs(c.canvas.width - rect.width) > 5) {
          c.init();
        }
      });
    });
  }

  return { init };
})();

window.addEventListener('DOMContentLoaded', ScratchCards.init);
