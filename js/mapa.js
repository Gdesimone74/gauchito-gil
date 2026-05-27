/**
 * mapa.js — Gauchito Gil
 * Mapa interactivo de santuarios en Argentina con Leaflet.js
 * Tiles oscuros de CartoDB Dark Matter (gratis, sin API key)
 */

const SANTUARIOS = [
  // ── PRINCIPAL ──────────────────────────────────────────────
  {
    lat: -29.1847, lng: -58.0622,
    nombre: 'Santuario Central de Mercedes',
    provincia: 'Corrientes',
    tipo: 'principal',
    desc: 'El santuario más importante del país. Recibe más de 400.000 peregrinos cada 8 de enero. Ubicado sobre la RN 123, es el corazón de la devoción popular al Gauchito Gil.'
  },

  // ── SANTUARIOS GRANDES ─────────────────────────────────────
  {
    lat: -27.4806, lng: -58.8341,
    nombre: 'Santuario de Corrientes Capital',
    provincia: 'Corrientes',
    tipo: 'grande',
    desc: 'Importante centro de devoción en la capital correntina. Muy visitado por los fieles de la región noreste.'
  },
  {
    lat: -34.6502, lng: -58.5263,
    nombre: 'Santuario de Puente La Noria',
    provincia: 'Buenos Aires',
    tipo: 'grande',
    desc: 'Uno de los santuarios más visitados del conurbano bonaerense, sobre la Av. General Paz. Un punto de encuentro para devotos que viajan rumbo al sur.'
  },
  {
    lat: -34.6118, lng: -58.3960,
    nombre: 'Oratorio de La Boca',
    provincia: 'Buenos Aires',
    tipo: 'grande',
    desc: 'Santuario muy popular en el barrio de La Boca, reflejo de la devoción obrera y popular que caracteriza al culto del Gauchito en la ciudad.'
  },
  {
    lat: -32.9468, lng: -60.6393,
    nombre: 'Santuario de Rosario',
    provincia: 'Santa Fe',
    tipo: 'grande',
    desc: 'Gran santuario en la ciudad de Rosario. La región central del país tiene una devoción muy arraigada al Gauchito Gil, especialmente entre camioneros y trabajadores.'
  },
  {
    lat: -31.4201, lng: -64.1888,
    nombre: 'Santuario de Córdoba',
    provincia: 'Córdoba',
    tipo: 'grande',
    desc: 'Centro devocional en la capital cordobesa. Miles de fieles realizan ofrendas cada 8 de enero y en fechas especiales.'
  },
  {
    lat: -32.8908, lng: -68.8272,
    nombre: 'Santuario de Mendoza',
    provincia: 'Mendoza',
    tipo: 'grande',
    desc: 'El santuario cuyana reúne a devotos de toda la región, incluyendo fieles que llegan desde Chile por los pasos cordilleranos.'
  },
  {
    lat: -38.0055, lng: -57.5426,
    nombre: 'Santuario de Mar del Plata',
    provincia: 'Buenos Aires',
    tipo: 'grande',
    desc: 'Santuario sobre la Ruta 2 a la entrada de Mar del Plata. Muy visitado por veranea-ntes que dejan ofrendas antes y después de las vacaciones.'
  },
  {
    lat: -34.9215, lng: -57.9545,
    nombre: 'Capilla de La Plata',
    provincia: 'Buenos Aires',
    tipo: 'grande',
    desc: 'Santuario en la capital bonaerense con fuerte presencia entre estudiantes universitarios y trabajadores de la administración pública.'
  },
  {
    lat: -38.7183, lng: -62.2661,
    nombre: 'Oratorio de Bahía Blanca',
    provincia: 'Buenos Aires',
    tipo: 'grande',
    desc: 'Punto de referencia para los camioneros que recorren la Ruta 3 hacia el sur patagónico. Uno de los santuarios más australes de la provincia.'
  },
  {
    lat: -27.4511, lng: -58.9867,
    nombre: 'Santuario de Resistencia',
    provincia: 'Chaco',
    tipo: 'grande',
    desc: 'Importante centro devocional en la capital chaqueña, con una comunidad de fieles muy activa que organiza peregrinaciones anuales a Mercedes.'
  },
  {
    lat: -27.3671, lng: -55.8961,
    nombre: 'Capilla de Posadas',
    provincia: 'Misiones',
    tipo: 'grande',
    desc: 'Santuario en la capital misionera. La devoción en la región noreste es muy fuerte, influenciada por la cercanía geográfica con Corrientes.'
  },
  {
    lat: -26.8083, lng: -65.2176,
    nombre: 'Santuario de Tucumán',
    provincia: 'Tucumán',
    tipo: 'grande',
    desc: 'Centro devocional en el norte argentino. Los devotos tucumanos organizan caravanas anuales hacia Mercedes cada enero.'
  },
  {
    lat: -24.7859, lng: -65.4117,
    nombre: 'Oratorio de Salta',
    provincia: 'Salta',
    tipo: 'grande',
    desc: 'Santuario en la ciudad de Salta. La región noroeste mantiene viva la tradición de las ofrendas y los exvotos al Gauchito.'
  },
  {
    lat: -38.9516, lng: -68.0591,
    nombre: 'Santuario de Neuquén',
    provincia: 'Neuquén',
    tipo: 'grande',
    desc: 'Uno de los santuarios más importantes de la Patagonia. Concentra devotos de toda la región, incluyendo trabajadores de la industria petrolera.'
  },
  {
    lat: -31.7320, lng: -60.5291,
    nombre: 'Oratorio de Paraná',
    provincia: 'Entre Ríos',
    tipo: 'grande',
    desc: 'Santuario en la capital entrerriana. La provincia de Entre Ríos, vecina de Corrientes, tiene una devoción muy arraigada desde hace décadas.'
  },
  {
    lat: -36.6167, lng: -64.2833,
    nombre: 'Capilla de Santa Rosa',
    provincia: 'La Pampa',
    tipo: 'grande',
    desc: 'Centro devocional en la capital pampeana. Los camioneros y viajeros que cruzan la llanura pampeana hacen parada en este santuario.'
  },

  // ── ORATORIOS / CAPILLAS ───────────────────────────────────
  {
    lat: -24.1858, lng: -65.2995,
    nombre: 'Capilla de Jujuy',
    provincia: 'Jujuy',
    tipo: 'chico',
    desc: 'Oratorio en la provincia más septentrional del país. La devoción al Gauchito llegó al NOA a través de los camioneros y migrantes internos.'
  },
  {
    lat: -33.2950, lng: -66.3356,
    nombre: 'Oratorio de San Luis',
    provincia: 'San Luis',
    tipo: 'chico',
    desc: 'Pequeño santuario sobre la Ruta 7, muy visitado por quienes viajan entre Buenos Aires y Mendoza.'
  },
  {
    lat: -45.8666, lng: -67.4769,
    nombre: 'Oratorio de Comodoro Rivadavia',
    provincia: 'Chubut',
    tipo: 'chico',
    desc: 'El Gauchito llegó al sur de la mano de los trabajadores petroleros. Este oratorio es un punto de encuentro para la comunidad devota patagónica.'
  },
  {
    lat: -51.6230, lng: -69.2168,
    nombre: 'Capilla de Río Gallegos',
    provincia: 'Santa Cruz',
    tipo: 'chico',
    desc: 'Uno de los santuarios más australes del mundo. El culto al Gauchito Gil llegó hasta el extremo sur del continente americano.'
  },
  {
    lat: -53.7876, lng: -67.7071,
    nombre: 'Oratorio de Ushuaia',
    provincia: 'Tierra del Fuego',
    tipo: 'chico',
    desc: 'El santuario más austral. En el confín del mundo, el Gauchito Gil también tiene devotos entre los habitantes y trabajadores de Ushuaia.'
  },
  {
    lat: -29.9027, lng: -57.5616,
    nombre: 'Santuario de Paso de los Libres',
    provincia: 'Corrientes',
    tipo: 'chico',
    desc: 'Ciudad fronteriza con Brasil. Los camioneros internacionales hacen parada para pedir protección en el cruce hacia Uruguay y Brasil.'
  },
  {
    lat: -30.8653, lng: -60.7010,
    nombre: 'Oratorio de Santo Tomé',
    provincia: 'Corrientes',
    tipo: 'chico',
    desc: 'Pequeño santuario en la región correntina, cerca del origen histórico del culto.'
  },
  {
    lat: -37.3317, lng: -59.1332,
    nombre: 'Oratorio de Tandil',
    provincia: 'Buenos Aires',
    tipo: 'chico',
    desc: 'Santuario en las sierras bonaerenses. Los peregrinos que viajan por la Ruta 226 suelen hacer parada en este oratorio.'
  },
  {
    lat: -33.6926, lng: -65.4638,
    nombre: 'Capilla de San Rafael',
    provincia: 'Mendoza',
    tipo: 'chico',
    desc: 'Santuario en el sur mendocino, muy visitado por los trabajadores agrícolas de la región vitivinícola.'
  },
  {
    lat: -28.4696, lng: -65.7852,
    nombre: 'Oratorio de La Rioja',
    provincia: 'La Rioja',
    tipo: 'chico',
    desc: 'El culto al Gauchito también está presente en la provincia riojana, con una pequeña pero fiel comunidad de devotos.'
  },
  {
    lat: -27.7824, lng: -64.2641,
    nombre: 'Capilla de Santiago del Estero',
    provincia: 'Santiago del Estero',
    tipo: 'chico',
    desc: 'Santuario en la ciudad más antigua del país. La devoción popular al Gauchito se mezcla aquí con tradiciones religiosas muy antiguas.'
  },
  {
    lat: -42.7692, lng: -65.0386,
    nombre: 'Oratorio de Trelew',
    provincia: 'Chubut',
    tipo: 'chico',
    desc: 'Santuario en la ciudad patagónica de Trelew. Los trabajadores rurales y los camioneros de la región son sus principales devotos.'
  },
  {
    lat: -40.8135, lng: -62.9967,
    nombre: 'Capilla de Viedma',
    provincia: 'Río Negro',
    tipo: 'chico',
    desc: 'Oratorio en la capital rionegrina. La devoción al Gauchito es fuerte entre las comunidades humildes de la región patagónica norte.'
  },
];

// ── Colores e íconos por tipo ─────────────────────────────────
const CONFIG_TIPO = {
  principal: { color: '#C9A84C', radio: 14, zIndex: 1000 },
  grande:    { color: '#CC0000', radio: 10, zIndex: 500  },
  chico:     { color: '#8B2020', radio:  7, zIndex: 100  },
};

function crearIcono(tipo) {
  const { color, radio } = CONFIG_TIPO[tipo];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${radio * 2 + 4}" height="${radio * 2 + 4}">
      <circle cx="${radio + 2}" cy="${radio + 2}" r="${radio}"
        fill="${color}" fill-opacity="0.9"
        stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      <circle cx="${radio + 2}" cy="${radio + 2}" r="${radio * 0.45}"
        fill="rgba(255,255,255,0.7)"/>
    </svg>
  `;
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const size = radio * 2 + 4;
  return L.icon({
    iconUrl: url,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 4)],
  });
}

function inicializarMapa() {
  const contenedor = document.getElementById('mapaLeaflet');
  if (!contenedor || typeof L === 'undefined') return;

  // Centrar en Argentina
  const mapa = L.map('mapaLeaflet', {
    center:          [-38.5, -65.0],
    zoom:            4,
    minZoom:         3,
    maxZoom:         14,
    zoomControl:     true,
    scrollWheelZoom: false, // evita scroll accidental en la página
  });

  // Tiles oscuros: CartoDB Dark Matter (gratis, sin key)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(mapa);

  // Agregar marcadores
  SANTUARIOS.forEach(s => {
    const icono = crearIcono(s.tipo);
    const cfg   = CONFIG_TIPO[s.tipo];

    const marker = L.marker([s.lat, s.lng], {
      icon:      icono,
      zIndexOffset: cfg.zIndex,
    }).addTo(mapa);

    // Halo pulsante para el principal
    if (s.tipo === 'principal') {
      L.circle([s.lat, s.lng], {
        color:       '#C9A84C',
        fillColor:   '#C9A84C',
        fillOpacity: 0.15,
        weight:      1,
        radius:      40000,
      }).addTo(mapa);
    }

    const tipoLabel = {
      principal: '✞ Santuario Principal',
      grande:    '🕯 Santuario Importante',
      chico:     '🔴 Oratorio / Capilla',
    }[s.tipo];

    marker.bindPopup(`
      <div class="popup-titulo">${s.nombre}</div>
      <div class="popup-tipo">${tipoLabel} · ${s.provincia}</div>
      <div class="popup-desc">${s.desc}</div>
    `, { maxWidth: 260 });

    // Pulsar halo en el principal
    if (s.tipo === 'principal') {
      let creciendo = true;
      const halos = [];
      // Solo animamos con CSS vía clase extra — no hace falta más complejidad
    }
  });

  // Activar scroll al hacer click en el mapa
  mapa.on('click', () => { mapa.scrollWheelZoom.enable(); });
  mapa.on('mouseout', () => { mapa.scrollWheelZoom.disable(); });

  // Animar aparición cuando la sección entra en viewport
  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '#mapa',
      start:   'top 70%',
      once:    true,
      onEnter: () => {
        contenedor.style.opacity = '0';
        contenedor.style.transform = 'translateY(20px)';
        contenedor.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        requestAnimationFrame(() => {
          contenedor.style.opacity = '1';
          contenedor.style.transform = 'translateY(0)';
        });
        // Invalidar tamaño del mapa para que se renderice bien
        setTimeout(() => mapa.invalidateSize(), 100);
      },
    });
  }
}

document.addEventListener('DOMContentLoaded', inicializarMapa);
