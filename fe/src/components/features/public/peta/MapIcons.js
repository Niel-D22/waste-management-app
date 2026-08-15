import L from "leaflet";

// Leaflet memakai L.divIcon, bukan gambar bawaan — jadi isi marker sepenuhnya
// HTML/SVG yang kita kendalikan sendiri. Bentuknya pin tetes air (bukan lagi
// lingkaran + segitiga terpisah seperti versi lama) supaya ujung bawahnya benar
// -benar runcing dan menunjuk tepat ke koordinatnya.

// Satu sumber kebenaran untuk warna + glyph tiap kategori. Warna ditulis hex,
// bukan class Tailwind, karena nilainya dipakai langsung sebagai atribut `fill`
// di dalam SVG — class Tailwind tidak berlaku di situ.
const MARKER_STYLE = {
  "Laporan Sampah": {
    color: "#EF4444",
    // Satu-satunya kategori yang berdenyut: laporan sampah adalah masalah yang
    // menunggu ditindak, jadi memang perlu menarik perhatian lebih dulu.
    pulsing: true,
    glyph:
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
  },
  Aset: {
    color: "#F59E0B",
    pulsing: false,
    glyph:
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>',
  },
  Kolaborator: {
    color: "#2563EB",
    pulsing: false,
    glyph:
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
  },
  "Barang Daur Ulang": {
    color: "#16A34A",
    pulsing: false,
    glyph:
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>',
  },
};

const FALLBACK_STYLE = {
  color: "#334155",
  pulsing: false,
  glyph: '<circle cx="12" cy="12" r="4" fill="white" stroke="none"/>',
};

// Ukuran pin. PIN_W/PIN_H harus sama persis dengan iconSize di bawah, dan
// HEAD_CY adalah titik pusat kepala pin — dipakai untuk menempatkan glyph dan
// cincin denyut supaya keduanya sejajar di tengah kepala, bukan di tengah kotak.
const PIN_W = 34;
const PIN_H = 44;
const HEAD_CY = 16.5;
const GLYPH_SIZE = 15;

const getIconHtml = (type) => {
  const style = MARKER_STYLE[type] || FALLBACK_STYLE;

  // Glyph aslinya digambar di kanvas 24x24. Diperkecil ke 15px lalu digeser
  // supaya pusatnya jatuh tepat di HEAD_CY — dihitung, bukan dikira-kira.
  const scale = GLYPH_SIZE / 24;
  const gx = PIN_W / 2 - GLYPH_SIZE / 2;
  const gy = HEAD_CY - GLYPH_SIZE / 2;

  const pulseRing = style.pulsing
    ? `<span style="position:absolute;left:${PIN_W / 2}px;top:${HEAD_CY}px;width:34px;height:34px;margin-left:-17px;margin-top:-17px;border-radius:9999px;background:${style.color};opacity:.35" class="animate-ping"></span>`
    : "";

  return `
    <div style="position:relative;width:${PIN_W}px;height:${PIN_H}px">
      ${pulseRing}
      <svg width="${PIN_W}" height="${PIN_H}" viewBox="0 0 ${PIN_W} ${PIN_H}"
           style="position:relative;display:block;filter:drop-shadow(0 4px 6px rgba(15,23,42,.28))">
        <path d="M17 1.6C8.55 1.6 1.7 8.45 1.7 16.9c0 4.2 2.4 9.06 5.3 13.2 2.9 4.15 6.2 7.5 7.7 8.95a3.3 3.3 0 0 0 4.6 0c1.5-1.45 4.8-4.8 7.7-8.95 2.9-4.14 5.3-9 5.3-13.2C32.3 8.45 25.45 1.6 17 1.6z"
              fill="${style.color}" stroke="#ffffff" stroke-width="3"/>
        <g transform="translate(${gx} ${gy}) scale(${scale})"
           fill="none" stroke="#ffffff">
          ${style.glyph}
        </g>
      </svg>
    </div>
  `;
};

export const getCustomIcon = (type) => {
  return new L.divIcon({
    className: "bg-transparent",
    html: getIconHtml(type),
    iconSize: [PIN_W, PIN_H],
    // Jangkar di ujung runcing paling bawah (x tengah, y = tinggi penuh),
    // supaya pin menunjuk tepat ke koordinatnya, bukan melayang di atasnya.
    iconAnchor: [PIN_W / 2, PIN_H],
    popupAnchor: [0, -PIN_H + 4],
  });
};
