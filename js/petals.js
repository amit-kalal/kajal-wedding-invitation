/**
 * ==============================================================================
 * FLOATING MARIGOLD & ROSE PETALS CANVAS ANIMATION
 * ==============================================================================
 * A lightweight, battery-efficient falling flower petal physics simulation
 * inspired by traditional Indian royal courtyard celebrations.
 * ==============================================================================
 */

(function () {
  const canvas = document.getElementById('petalsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let petals = [];
  const PETAL_COUNT = 24; // Optimized for smooth 60fps on mobile
  let animationFrameId = null;

  // Colors: Auspicious Marigold (Orange & Yellow) and Gulab (Soft Rose Pink & Sindoor)
  const PETAL_PALETTES = [
    { fill: '#FFAE19', stroke: '#E65100', type: 'marigold' },
    { fill: '#FFD54F', stroke: '#F57F17', type: 'marigold' },
    { fill: '#E53935', stroke: '#B71C1C', type: 'rose' },
    { fill: '#F06292', stroke: '#C2185B', type: 'rose' },
    { fill: '#FF8A80', stroke: '#D32F2F', type: 'rose' }
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  class Petal {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      this.x = Math.random() * width;
      this.y = isInitial ? Math.random() * height : -30;
      this.size = 9 + Math.random() * 8; // 9px to 17px
      this.speedY = 0.8 + Math.random() * 1.4;
      this.speedX = -0.5 + Math.random() * 1.0;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.015 + Math.random() * 0.02;
      this.palette = PETAL_PALETTES[Math.floor(Math.random() * PETAL_PALETTES.length)];
      this.opacity = 0.75 + Math.random() * 0.25;
    }

    update() {
      this.y += this.speedY;
      this.swayAngle += this.swaySpeed;
      this.x += Math.sin(this.swayAngle) * 0.9 + this.speedX;
      this.rotation += this.rotSpeed;

      // Reset when falling off screen
      if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      ctx.fillStyle = this.palette.fill;
      ctx.strokeStyle = this.palette.stroke;
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      if (this.palette.type === 'marigold') {
        // Slender teardrop marigold petal
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.5, 0, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.5, 0, 0, -this.size);
      } else {
        // Curvy, romantic rose petal
        ctx.moveTo(0, -this.size * 0.8);
        ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.6, this.size * 0.8, this.size * 0.6, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.6, -this.size * 0.8, -this.size * 0.6, 0, -this.size * 0.8);
      }
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);

    petals = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push(new Petal(true));
    }

    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    animationFrameId = requestAnimationFrame(loop);
  }

  // Battery saving when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      loop();
    }
  });

  window.addEventListener('DOMContentLoaded', init);
})();
