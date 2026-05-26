/**
 * particles.js — Gauchito Gil
 * Sistema de banderitas rojas flotando, como en los santuarios.
 */

class Banderita {
  static COLORES = [
    '#CC0000', '#8B0000', '#FF0000',
    '#990000', '#B22222', '#C9A84C',
  ];

  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
    this.y = Math.random() * canvas.height;
  }

  reset() {
    const c = this.canvas;
    this.x         = Math.random() * c.width;
    this.y         = c.height + Math.random() * 40;
    this.ancho     = 8  + Math.random() * 12;
    this.alto      = 5  + Math.random() * 7;
    this.color     = Banderita.COLORES[Math.floor(Math.random() * Banderita.COLORES.length)];
    this.vy        = 0.4 + Math.random() * 0.8;
    this.amplitud  = 20  + Math.random() * 40;
    this.frecuencia= 0.01 + Math.random() * 0.02;
    this.faseX     = Math.random() * Math.PI * 2;
    this.angulo    = (Math.random() - 0.5) * 0.6;
    this.vAngulo   = (Math.random() - 0.5) * 0.03;
    this.opacidadBase = 0.4 + Math.random() * 0.5;
    this.opacidad  = this.opacidadBase;
    this.fasePulso = Math.random() * Math.PI * 2;
    this.velPulso  = 0.01 + Math.random() * 0.02;
    this.t         = Math.random() * 1000;
  }

  update() {
    this.t += 1;
    this.y -= this.vy;
    this.x += Math.sin(this.t * this.frecuencia + this.faseX) * 0.6;
    this.angulo += this.vAngulo;
    this.opacidad = this.opacidadBase +
      Math.sin(this.t * this.velPulso + this.fasePulso) * 0.15;
    this.opacidad = Math.max(0.2, Math.min(1, this.opacidad));
    if (this.y < -this.alto - 10) this.reset();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angulo);
    ctx.globalAlpha = this.opacidad;
    ctx.fillStyle   = this.color;
    ctx.fillRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth   = 0.5;
    ctx.strokeRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto);
    ctx.restore();
  }
}

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx        = this.canvas.getContext('2d');
    this.banderitas = [];
    this.cantidad   = 80;
    this.animId     = null;
    this.init();
  }

  init() {
    this._ajustarTamano();
    window.addEventListener('resize', () => this._ajustarTamano());
    this.banderitas = [];
    for (let i = 0; i < this.cantidad; i++) {
      this.banderitas.push(new Banderita(this.canvas));
    }
    this.animate();
  }

  _ajustarTamano() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _dibujarFondo() {
    const { ctx, canvas } = this;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0,   '#0a0a0a');
    grad.addColorStop(0.6, '#1a0000');
    grad.addColorStop(1,   '#4a0000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  animate() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this._dibujarFondo();
    for (const b of this.banderitas) {
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
