/**
 * particles.js — Gauchito Gil
 * Brasas / chispas que suben como de una vela o fogón.
 */

class Brasa {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
    // Distribuir al inicio por toda la altura
    this.y = Math.random() * canvas.height;
    this.vida = Math.random();
  }

  reset() {
    const c = this.canvas;
    // Nacer desde la franja inferior
    this.x    = c.width  * 0.1 + Math.random() * c.width  * 0.8;
    this.y    = c.height * 0.7 + Math.random() * c.height * 0.3;
    this.vida = 1;

    // Velocidad: sube con leve deriva lateral
    this.vy   = -(0.4 + Math.random() * 1.2);
    this.vx   = (Math.random() - 0.5) * 0.6;

    // Tamaño: mezcla de brasas chicas y grandes
    this.r    = 0.8 + Math.random() * 3;

    // Temperatura → color
    // 0 = fría (rojo oscuro), 1 = caliente (blanco-amarillo)
    this.temp = Math.random();

    // Oscilación lateral suave
    this.fase   = Math.random() * Math.PI * 2;
    this.ampOsc = 0.3 + Math.random() * 0.8;
    this.frOsc  = 0.03 + Math.random() * 0.04;

    // Vida útil: las más grandes duran menos
    this.decaimiento = 0.004 + Math.random() * 0.012;

    this.t = 0;
  }

  update() {
    this.t++;
    this.y  += this.vy;
    this.x  += this.vx + Math.sin(this.t * this.frOsc + this.fase) * this.ampOsc;
    this.vy *= 0.995;         // leve desaceleración al subir
    this.vida -= this.decaimiento;
    this.r   *= 0.998;        // se achica gradualmente
    if (this.vida <= 0 || this.y < -20) this.reset();
  }

  draw(ctx) {
    const a = Math.max(0, this.vida);
    // Color según temperatura
    let color;
    if (this.temp > 0.75) {
      // Muy caliente: blanco-amarillo
      color = `rgba(255, 245, 200, ${a})`;
    } else if (this.temp > 0.5) {
      // Caliente: naranja brillante
      color = `rgba(255, ${Math.floor(150 + this.temp * 60)}, 20, ${a})`;
    } else if (this.temp > 0.25) {
      // Tibio: naranja-rojo
      color = `rgba(255, ${Math.floor(60 + this.temp * 120)}, 0, ${a})`;
    } else {
      // Fría: rojo oscuro
      color = `rgba(${Math.floor(180 + this.temp * 75)}, 20, 0, ${a * 0.7})`;
    }

    ctx.save();

    // Halo de calor (glow)
    if (this.r > 1.5 && this.vida > 0.3) {
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
      glow.addColorStop(0,   color.replace(')', ', 0.3)').replace('rgba(', 'rgba('));
      glow.addColorStop(1,   'rgba(0,0,0,0)');
      // Simplificado: solo glow en brasas grandes
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 100, 0, ${a * 0.08})`;
      ctx.fill();
    }

    // Núcleo de la brasa
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    grad.addColorStop(0,   `rgba(255, 255, 220, ${a})`);
    grad.addColorStop(0.4, color);
    grad.addColorStop(1,   'rgba(100, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }
}

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx     = this.canvas.getContext('2d');
    this.brasas  = [];
    this.cantidad = 120;
    this.animId  = null;
    this.init();
  }

  init() {
    this._ajustarTamano();
    window.addEventListener('resize', () => this._ajustarTamano());
    for (let i = 0; i < this.cantidad; i++) {
      this.brasas.push(new Brasa(this.canvas));
    }
    this.animate();
  }

  _ajustarTamano() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _dibujarFondo() {
    const { ctx, canvas } = this;
    // Gradiente: negro arriba → rojo muy oscuro abajo
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0,    '#080808');
    grad.addColorStop(0.55, '#120000');
    grad.addColorStop(0.85, '#2a0000');
    grad.addColorStop(1,    '#3d0000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Viñeta lateral suave
    const vig = ctx.createRadialGradient(
      canvas.width / 2, canvas.height * 0.6, canvas.height * 0.1,
      canvas.width / 2, canvas.height * 0.6, canvas.width * 0.8
    );
    vig.addColorStop(0,   'rgba(80,0,0,0.15)');
    vig.addColorStop(1,   'rgba(0,0,0,0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  animate() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this._dibujarFondo();
    for (const b of this.brasas) {
      b.update();
      b.draw(ctx);
    }
    this.animId = requestAnimationFrame(() => this.animate());
  }

  detener() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem('particlesCanvas');
});
