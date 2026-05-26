/**
 * altar.js — Gauchito Gil
 * Altar digital interactivo con velas animadas en canvas.
 * Persistencia en localStorage. Sonido con Web Audio API.
 */

// ══════════════════════════════════════════════
// Ruido suave para la llama (Perlin simplificado)
// ══════════════════════════════════════════════
class RuidoSuave {
  constructor(semilla = 1) {
    this.semilla = semilla;
    this.cache   = {};
  }
  _hash(n) {
    let x = Math.sin(n + this.semilla) * 43758.5453123;
    return x - Math.floor(x);
  }
  _smoothstep(t) { return t * t * (3 - 2 * t); }
  valor(t) {
    const i  = Math.floor(t);
    const f  = t - i;
    const a  = this._hash(i);
    const b  = this._hash(i + 1);
    const s  = this._smoothstep(f);
    return a + (b - a) * s;
  }
}

// ══════════════════════════════════════════════
// Chispa — partícula al encender la vela
// ══════════════════════════════════════════════
class Chispa {
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    this.vx   = (Math.random() - 0.5) * 3;
    this.vy   = -(1.5 + Math.random() * 2.5);
    this.vida = 1;
    this.r    = 2 + Math.random() * 2;
    // Color HSL entre amarillo y naranja
    this.hue  = 30 + Math.random() * 30;
  }

  update() {
    this.x   += this.vx;
    this.y   += this.vy;
    this.vy  += 0.08; // gravedad
    this.vx  *= 0.97; // rozamiento
    this.vida -= 0.04;
    this.r   *= 0.97;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.vida);
    ctx.fillStyle   = `hsl(${this.hue}, 100%, 60%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  get muerta() { return this.vida <= 0 || this.r < 0.3; }
}

// ══════════════════════════════════════════════
// Partícula de humo
// ══════════════════════════════════════════════
class Humo {
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    this.vx   = (Math.random() - 0.5) * 0.8;
    this.vy   = -(0.5 + Math.random());
    this.vida = 1;
    this.r    = 4 + Math.random() * 6;
  }
  update() {
    this.x   += this.vx;
    this.y   += this.vy;
    this.r   *= 1.02;
    this.vida -= 0.025;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.vida * 0.4);
    ctx.fillStyle   = '#888';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  get muerta() { return this.vida <= 0; }
}

// ══════════════════════════════════════════════
// VelaAltar — una sola vela
// ══════════════════════════════════════════════
class VelaAltar {
  constructor(x, y, nombre, peticion, indice) {
    this.x        = x;
    this.y        = y;
    this.nombre   = nombre;
    this.peticion = peticion;
    this.indice   = indice;

    // Dimensiones
    this.anchoVela = 18 + Math.random() * 8;
    this.altoVela  = 55 + Math.random() * 30;

    // Estado
    this.encendida  = true;
    this.escala     = 0; // para animación de aparición
    this.escalaObj  = 1;
    this.mostrarTip = false;
    this.opaTip     = 0;

    // Ruido para la llama
    this.ruido = new RuidoSuave(indice * 31.7 + Math.random() * 100);
    this.t     = Math.random() * 100;

    // Chispas y humo
    this.chispas = [];
    this.humos   = [];

    // Gotitas de cera (posiciones fijas relativas)
    this.gotas = Array.from({ length: 3 }, () => ({
      xOff: (Math.random() - 0.5) * this.anchoVela,
      yOff: this.altoVela * (0.3 + Math.random() * 0.5),
      r:    2 + Math.random() * 3,
    }));

    // Lanzar chispas de encendido
    this._crearChispas(30);
  }

  _crearChispas(n) {
    const cx = this.x;
    const cy = this.y - this.altoVela - 14;
    for (let i = 0; i < n; i++) {
      this.chispas.push(new Chispa(cx, cy));
    }
  }

  apagar() {
    if (!this.encendida) return;
    this.encendida = false;
    // Crear humo
    const cx = this.x;
    const cy = this.y - this.altoVela - 10;
    for (let i = 0; i < 12; i++) this.humos.push(new Humo(cx, cy));
  }

  hitTest(px, py) {
    const halfA = this.anchoVela / 2;
    return px >= this.x - halfA && px <= this.x + halfA &&
           py >= this.y - this.altoVela - 20 && py <= this.y + 5;
  }

  update() {
    this.t += 0.04;

    // Spring de escala al aparecer
    const diff = this.escalaObj - this.escala;
    this.escala += diff * 0.12;

    // Chispas
    this.chispas = this.chispas.filter(c => { c.update(); return !c.muerta; });

    // Humo
    this.humos = this.humos.filter(h => { h.update(); return !h.muerta; });

    // Tooltip fade
    this.opaTip += (this.mostrarTip ? 1 : -1) * 0.08;
    this.opaTip  = Math.max(0, Math.min(1, this.opaTip));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.escala, this.escala);

    // ── Cuerpo de la vela ──────────────────────
    const grad = ctx.createLinearGradient(-this.anchoVela / 2, 0, this.anchoVela / 2, 0);
    grad.addColorStop(0,    '#6a0000');
    grad.addColorStop(0.25, '#CC0000');
    grad.addColorStop(0.5,  '#FF4444');
    grad.addColorStop(0.75, '#CC0000');
    grad.addColorStop(1,    '#6a0000');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(
      -this.anchoVela / 2,
      -this.altoVela,
      this.anchoVela,
      this.altoVela,
      [3, 3, 0, 0]
    );
    ctx.fill();

    // Borde sutil
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    // ── Gotitas de cera ─────────────────────────
    ctx.fillStyle = 'rgba(255,200,150,0.5)';
    for (const g of this.gotas) {
      ctx.beginPath();
      ctx.ellipse(g.xOff, -this.altoVela + g.yOff, g.r, g.r * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Pabilo ──────────────────────────────────
    ctx.strokeStyle = '#333';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -this.altoVela);
    ctx.lineTo(0, -this.altoVela - 8);
    ctx.stroke();

    // ── Llama (si está encendida) ────────────────
    if (this.encendida) {
      const oscX  = this.ruido.valor(this.t) * 6 - 3;
      const oscY  = this.ruido.valor(this.t + 50) * 4 - 2;
      const escLl = 0.85 + this.ruido.valor(this.t * 1.3) * 0.3;

      const flamaBase = this.y - this.altoVela;
      const baseY     = -this.altoVela - 8;

      ctx.save();
      ctx.translate(oscX * 0.5, -this.altoVela - 8);
      ctx.scale(escLl, escLl);

      // Halo de luz exterior
      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
      halo.addColorStop(0,   'rgba(255,180,0,0.25)');
      halo.addColorStop(0.5, 'rgba(255,80,0,0.1)');
      halo.addColorStop(1,   'rgba(255,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Llama exterior
      const gLl = ctx.createRadialGradient(oscX * 0.3, 0, 0, oscX * 0.3, -16, 18);
      gLl.addColorStop(0,   '#FFF176');
      gLl.addColorStop(0.3, '#FF9800');
      gLl.addColorStop(0.7, '#CC0000');
      gLl.addColorStop(1,   'rgba(180,0,0,0)');

      ctx.fillStyle = gLl;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        8 + oscX, -8,
        6 + oscX * 0.5, -24 + oscY,
        0 + oscX * 0.3, -28 + oscY
      );
      ctx.bezierCurveTo(
        -6 + oscX * 0.5, -24 + oscY,
        -8 + oscX, -8,
        0, 0
      );
      ctx.fill();

      // Núcleo brillante
      const gCore = ctx.createRadialGradient(0, -6, 0, 0, -6, 8);
      gCore.addColorStop(0,   'rgba(255,255,220,0.9)');
      gCore.addColorStop(0.5, 'rgba(255,220,100,0.6)');
      gCore.addColorStop(1,   'rgba(255,150,0,0)');
      ctx.fillStyle = gCore;
      ctx.beginPath();
      ctx.ellipse(oscX * 0.2, -6, 5, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();

    // ── Chispas y humo (sin scale del ctx padre) ─
    for (const c of this.chispas) c.draw(ctx);
    for (const h of this.humos)   h.draw(ctx);

    // ── Nombre debajo de la vela ─────────────────
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = Math.min(1, this.escala);
    ctx.fillStyle   = 'rgba(245,240,232,0.75)';
    ctx.font        = '10px EB Garamond, serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline= 'top';
    ctx.fillText(this.nombre.length > 12 ? this.nombre.slice(0, 11) + '…' : this.nombre, 0, 8);
    ctx.restore();

    // ── Tooltip ──────────────────────────────────
    if (this.opaTip > 0.05) {
      this._dibujarTooltip(ctx);
    }
  }

  _dibujarTooltip(ctx) {
    const TW = 180, PAD = 10, LH = 16;
    const lines = this._wrapTexto(this.peticion, TW - PAD * 2, ctx);
    const TH = PAD * 2 + LH + 4 + lines.length * LH;

    let tx = this.x - TW / 2;
    let ty = this.y - this.altoVela - TH - 20;
    if (tx < 4) tx = 4;

    ctx.save();
    ctx.globalAlpha = this.opaTip;

    // Fondo
    ctx.fillStyle = 'rgba(20,0,0,0.92)';
    ctx.beginPath();
    ctx.roundRect(tx, ty, TW, TH, 6);
    ctx.fill();

    // Borde rojo
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Nombre
    ctx.fillStyle    = '#C9A84C';
    ctx.font         = 'bold 11px Cinzel, serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(this.nombre, tx + PAD, ty + PAD);

    // Separador
    ctx.strokeStyle = 'rgba(139,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(tx + PAD, ty + PAD + LH + 2);
    ctx.lineTo(tx + TW - PAD, ty + PAD + LH + 2);
    ctx.stroke();

    // Petición
    ctx.fillStyle = 'rgba(245,240,232,0.85)';
    ctx.font      = '10px EB Garamond, serif';
    lines.forEach((line, i) => {
      ctx.fillText(line, tx + PAD, ty + PAD + LH + 6 + i * LH);
    });

    ctx.restore();
  }

  _wrapTexto(texto, maxW, ctx) {
    const palabras = texto.split(' ');
    const lines    = [];
    let linea      = '';
    ctx.font       = '10px EB Garamond, serif';
    for (const pal of palabras) {
      const prueba = linea ? linea + ' ' + pal : pal;
      if (ctx.measureText(prueba).width > maxW && linea) {
        lines.push(linea);
        linea = pal;
      } else {
        linea = prueba;
      }
    }
    if (linea) lines.push(linea);
    return lines;
  }
}

// ══════════════════════════════════════════════
// AltarDigital — controlador principal
// ══════════════════════════════════════════════
class AltarDigital {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas  = document.createElement('canvas');
    this.ctx     = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.velas   = [];
    this.animId  = null;
    this.MAX_VELAS = 50;

    this._ajustarCanvas();
    this._bindEventos();
    this._cargarVelas();

    // Loop de animación
    this._loop();
  }

  _ajustarCanvas() {
    const rect       = this.container.getBoundingClientRect();
    const dpr        = window.devicePixelRatio || 1;
    const ancho      = rect.width  || this.container.offsetWidth  || 800;
    const alto       = 320;

    this.canvas.width  = ancho * dpr;
    this.canvas.height = alto  * dpr;
    this.canvas.style.width  = ancho + 'px';
    this.canvas.style.height = alto  + 'px';
    this.ctx.scale(dpr, dpr);

    this.W = ancho;
    this.H = alto;
  }

  _bindEventos() {
    // Hover: mostrar tooltip
    this.canvas.addEventListener('mousemove', e => {
      const { x, y } = this._posCanvas(e);
      let alguna = false;
      for (const v of this.velas) {
        const hit = v.hitTest(x, y);
        v.mostrarTip = hit;
        if (hit) alguna = true;
      }
      this.canvas.style.cursor = alguna ? 'pointer' : 'default';
    });

    // Doble click: apagar vela
    this.canvas.addEventListener('dblclick', e => {
      const { x, y } = this._posCanvas(e);
      for (const v of this.velas) {
        if (v.hitTest(x, y)) { v.apagar(); break; }
      }
    });

    // Resize
    const ro = new ResizeObserver(() => this._ajustarCanvas());
    ro.observe(this.container);
  }

  _posCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  agregarVela(nombre, peticion) {
    const pos  = this._encontrarPosicion();
    const vela = new VelaAltar(pos.x, pos.y, nombre, peticion, this.velas.length);
    this.velas.push(vela);

    // FIFO: si hay más de MAX, eliminar la más vieja
    if (this.velas.length > this.MAX_VELAS) this.velas.shift();

    this._guardarVelas();
    this._actualizarContador();
    this._reproducirSonidoEncendido();
  }

  _encontrarPosicion() {
    const MARGEN = 30;
    const altoVelaMed = 75;
    const minX = MARGEN + 15;
    const maxX = this.W - MARGEN - 15;
    const minY = altoVelaMed + MARGEN;
    const maxY = this.H - MARGEN;

    for (let intento = 0; intento < 20; intento++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      // Verificar solapamiento
      const ok = this.velas.every(v =>
        Math.hypot(v.x - x, v.y - y) > 40
      );
      if (ok) return { x, y };
    }
    // Si no encontramos lugar libre, forzar posición
    return {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
    };
  }

  _guardarVelas() {
    const datos = this.velas.map(v => ({
      x: v.x, y: v.y,
      nombre: v.nombre,
      peticion: v.peticion,
    }));
    try {
      localStorage.setItem('gauchito_velas', JSON.stringify(datos));
    } catch(e) { /* storage lleno, ignorar */ }
  }

  _cargarVelas() {
    try {
      const raw = localStorage.getItem('gauchito_velas');
      if (!raw) return;
      const datos = JSON.parse(raw);
      datos.forEach((d, i) => {
        const v = new VelaAltar(d.x, d.y, d.nombre, d.peticion, i);
        v.escala = 1; // aparecen directamente
        this.velas.push(v);
      });
      this._actualizarContador();
    } catch(e) { /* JSON roto, ignorar */ }
  }

  _actualizarContador() {
    const el = document.getElementById('contadorVelas');
    if (el) el.textContent = this.velas.length;
  }

  _reproducirSonidoEncendido() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) { /* sin soporte de audio, ok */ }
  }

  _dibujarFondo() {
    const { ctx, W, H } = this;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   '#0d0000');
    grad.addColorStop(0.7, '#150000');
    grad.addColorStop(1,   '#1a0000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Suelo del altar
    ctx.fillStyle = 'rgba(139,0,0,0.2)';
    ctx.fillRect(0, H - 18, W, 18);

    // Mensaje si no hay velas
    if (this.velas.length === 0) {
      ctx.fillStyle    = 'rgba(245,240,232,0.3)';
      ctx.font         = 'italic 16px EB Garamond, serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Sé el primero en encender tu vela...', W / 2, H / 2);
    }
  }

  _loop() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    this._dibujarFondo();

    for (const v of this.velas) {
      v.update();
      v.draw(ctx);
    }

    this.animId = requestAnimationFrame(() => this._loop());
  }
}

// ══════════════════════════════════════════════
// Conectar con el formulario del HTML
// ══════════════════════════════════════════════
function inicializarAltarDigital() {
  const altar = new AltarDigital('altarWrapper');
  if (!altar.container) return;

  const form    = document.getElementById('altarForm');
  const inputN  = document.getElementById('nombreDevoto');
  const inputP  = document.getElementById('peticionDevoto');
  const btnEnc  = document.getElementById('encenderVelaBtn');

  if (!form || !inputN || !inputP) return;

  // Inyectar CSS de animación de sacudida
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sacudida {
      0%,100%{transform:translateX(0)}
      20%    {transform:translateX(-8px)}
      40%    {transform:translateX(8px)}
      60%    {transform:translateX(-5px)}
      80%    {transform:translateX(5px)}
    }
    .sacudir { animation: sacudida 0.4s ease; border-color: #CC0000 !important; }
  `;
  document.head.appendChild(style);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre   = inputN.value.trim();
    const peticion = inputP.value.trim();

    if (!nombre) {
      inputN.classList.add('sacudir');
      inputN.addEventListener('animationend', () => inputN.classList.remove('sacudir'), { once: true });
      inputN.focus();
      return;
    }

    altar.agregarVela(
      nombre    || 'Devoto anónimo',
      peticion  || 'Con fe en el Gauchito Gil.'
    );

    // Animación del botón
    if (btnEnc) {
      btnEnc.textContent = '✓ ¡Vela encendida!';
      btnEnc.style.background = '#006600';
      setTimeout(() => {
        btnEnc.textContent = '🕯️ Encender vela';
        btnEnc.style.background = '';
      }, 2000);
    }

    // Limpiar form
    inputN.value = '';
    inputP.value = '';

    // Scroll al altar canvas
    altar.canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Exponer para debugging
  window.altarDigital = altar;
}

document.addEventListener('DOMContentLoaded', inicializarAltarDigital);
