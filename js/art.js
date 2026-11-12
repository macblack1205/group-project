/* Askıda prototype: icons and illustrations (all inline SVG, no image files needed). */
window.ART = (function () {
  "use strict";

  /* ---------- Icons (24px, stroke) ---------- */
  const P = {
    "chev-l": '<path d="m15 18-6-6 6-6"/>',
    "chev-r": '<path d="m9 18 6-6-6-6"/>',
    "chev-d": '<path d="m6 9 6 6 6-6"/>',
    "arrow-l": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    "arrow-r": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.3-4.3"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M12 17.6l-2.3-2.2a1.5 1.5 0 0 1 2.3-1.9 1.5 1.5 0 0 1 2.3 1.9z"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    map: '<path d="M14.1 5.55a2 2 0 0 0 1.79 0l3.66-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.27a2 2 0 0 1-1.79 0l-4.21-2.1a2 2 0 0 0-1.79 0l-3.66 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9L8.1 3.45a2 2 0 0 1 1.79 0z"/><path d="M15 5.76v15"/><path d="M9 3.24v15"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    apple: '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    nav: '<path d="M3 11 22 2l-9 19-2-8-8-2z"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    play: '<path d="M6 3l14 9-14 9z"/>',
    pointer: '<path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.04 9.69a.5.5 0 0 1 .65-.65l11 4.5a.5.5 0 0 1-.07.95l-4.35 1.04a1 1 0 0 0-.74.74l-1.04 4.35a.5.5 0 0 1-.95.07z"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    alert: '<circle cx="12" cy="12" r="9.5"/><path d="M12 8v4M12 16h.01"/>',
    edit: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    expand: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    phone: '<rect width="12" height="20" x="6" y="2" rx="2.5"/><path d="M11 18h2"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  };
  function icon(n, cls) {
    return '<svg class="i' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || P.info) + "</svg>";
  }

  /* ---------- Item illustrations (240 x 180) ---------- */
  let uid = 0;
  const sh = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="7" fill="#4a3b26" opacity=".10"/>`;
  const knit = (id) => `<pattern id="${id}" width="8" height="7" patternUnits="userSpaceOnUse"><path d="M0 1.5l4 4 4-4" fill="none" stroke="#3b2a1a" stroke-opacity=".11" stroke-width="1.3"/></pattern>`;
  const cable = (x, y, c) => `<path d="M${x} ${y}q7 6 0 12t0 12" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const book = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}"/><rect x="${x + w - 11}" y="${y + 3}" width="8" height="${h - 6}" rx="1.5" fill="#F7F1E5"/><rect x="${x + 10}" y="${y + h / 2 - 2}" width="${Math.round(w * 0.38)}" height="4" rx="2" fill="#fff" opacity=".35"/>`;

  const I = {
    sweater() {
      const k = "kn" + ++uid;
      return `<defs>${knit(k)}</defs>${sh(120, 157, 88)}
      <rect x="38" y="112" width="164" height="40" rx="12" fill="#C3A183"/><rect x="38" y="112" width="164" height="40" rx="12" fill="url(#${k})"/><rect x="38" y="140" width="164" height="12" rx="6" fill="#AE8D70"/>
      <rect x="46" y="76" width="148" height="42" rx="12" fill="#E4CFB6"/><rect x="46" y="76" width="148" height="42" rx="12" fill="url(#${k})"/><rect x="46" y="106" width="148" height="12" rx="6" fill="#D2BA9D"/>
      <rect x="54" y="40" width="132" height="42" rx="12" fill="#D7B999"/><rect x="54" y="40" width="132" height="42" rx="12" fill="url(#${k})"/><rect x="54" y="70" width="132" height="12" rx="6" fill="#C6A684"/>
      ${cable(96, 44, "#BE9C79")}${cable(120, 44, "#BE9C79")}${cable(144, 44, "#BE9C79")}${cable(104, 80, "#D2BA9D")}${cable(136, 80, "#D2BA9D")}`;
    },
    jacket() {
      return `${sh(120, 158, 78)}
      <path d="M84 36 58 52 42 140q0 6 6 6h16l8-54v58h96V92l8 54h16q6 0 6-6L182 52l-26-16z" fill="#9C7451"/>
      <path d="M72 92l4-36M168 92l-4-36" stroke="#86613F" stroke-width="2.5" fill="none"/>
      <path d="M96 30 84 36l16 26 20-18 20 18 16-26-12-6q-24 16-48 0z" fill="#7F5C3E"/>
      <path d="M120 46v104" stroke="#5E432D" stroke-width="3"/>
      <path d="M86 108h20M134 108h20" stroke="#6E4F35" stroke-width="4" stroke-linecap="round"/>
      <rect x="72" y="142" width="96" height="8" fill="#86613F"/>`;
    },
    apples() {
      const a = [[78, 84, 20, "#C8553D"], [112, 78, 21, "#D86F3C"], [148, 82, 20, "#BF4A33"], [178, 90, 18, "#D9813F"], [96, 96, 19, "#B8442F"], [132, 98, 20, "#CC5B3A"], [164, 102, 18, "#C24E36"]];
      const ap = a.map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.28}" ry="${r * 0.18}" fill="#fff" opacity=".3"/><path d="M${x} ${y - r + 2}q1-6 4-8" stroke="#5B4632" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join("");
      return `${sh(120, 158, 92)}${ap}
      <ellipse cx="122" cy="58" rx="10" ry="5" fill="#7E9A62" transform="rotate(-25 122 58)"/><ellipse cx="160" cy="66" rx="9" ry="4.5" fill="#8FAA70" transform="rotate(20 160 66)"/>
      <rect x="34" y="104" width="172" height="50" rx="5" fill="#B88A5D"/>
      <rect x="34" y="106" width="172" height="15" rx="2" fill="#D3A777"/><rect x="34" y="128" width="172" height="15" rx="2" fill="#D3A777"/>
      <rect x="34" y="104" width="11" height="50" rx="2" fill="#A97C52"/><rect x="195" y="104" width="11" height="50" rx="2" fill="#A97C52"/>`;
    },
    bread() {
      let dots = "";
      for (let i = 0; i < 16; i++) {
        const t = (i / 16) * Math.PI * 2, r = i % 2 ? 34 : 26;
        dots += `<ellipse cx="${(170 + Math.cos(t) * r).toFixed(1)}" cy="${(110 + Math.sin(t) * r * 0.78).toFixed(1)}" rx="2.3" ry="1.3" fill="#F6E2B8"/>`;
      }
      return `${sh(124, 156, 98)}
      <ellipse cx="82" cy="116" rx="54" ry="36" fill="#C98E50"/><ellipse cx="82" cy="108" rx="49" ry="28" fill="#E0AC6C"/>
      <path d="M56 104q10-11 20 0M78 99q10-11 20 0M100 104q9-10 18 0" stroke="#BF8246" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="170" cy="110" rx="30" ry="23.5" fill="none" stroke="#B5743A" stroke-width="16"/>${dots}`;
    },
    drygoods() {
      let l = "";
      for (let i = 0; i < 26; i++) l += `<circle cx="${54 + ((i * 13) % 38)}" cy="${98 + ((i * 7) % 42)}" r="2.6" fill="#EFA26B"/>`;
      return `${sh(124, 156, 92)}
      <rect x="44" y="58" width="58" height="92" rx="12" fill="#F1EADC" stroke="#D9CCB4" stroke-width="2"/><rect x="48" y="92" width="50" height="54" rx="9" fill="#D9773F"/>${l}<rect x="48" y="46" width="50" height="15" rx="4" fill="#B98B5E"/>
      <path d="M112 66h48l7 84h-62z" fill="#F4EFE4" stroke="#DCD2BF" stroke-width="2"/><path d="M116 66q20-15 40 0" stroke="#C9B994" stroke-width="3" fill="none"/><rect x="118" y="98" width="38" height="24" rx="3" fill="#A8B69A"/><path d="M124 110h26" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
      <rect x="174" y="70" width="36" height="80" rx="3" fill="#E2B85E"/><rect x="180" y="90" width="24" height="30" rx="3" fill="#F6E7BD"/><path d="M184 98l16 14M184 110l16-8" stroke="#E2B85E" stroke-width="2.5" stroke-linecap="round"/>`;
    },
    books() {
      return `${sh(120, 156, 82)}${book(50, 126, 140, 24, "#4F6A43")}${book(60, 102, 122, 24, "#D8B9A5")}${book(46, 78, 130, 24, "#A8B69A")}${book(66, 54, 110, 24, "#C98E5A")}
      <path d="M150 54v-14l8 6 8-6v14" fill="#B5543E"/>`;
    },
    textbooks() {
      return `${sh(120, 156, 78)}
      <rect x="64" y="40" width="28" height="110" rx="3" fill="#4F6A43"/><rect x="70" y="56" width="16" height="4" rx="2" fill="#fff" opacity=".45"/><rect x="70" y="128" width="16" height="10" rx="2" fill="#fff" opacity=".2"/>
      <rect x="94" y="54" width="24" height="96" rx="3" fill="#C98E5A"/><rect x="99" y="68" width="14" height="4" rx="2" fill="#fff" opacity=".45"/>
      <rect x="120" y="46" width="30" height="104" rx="3" fill="#A8B69A"/><rect x="126" y="60" width="18" height="4" rx="2" fill="#fff" opacity=".5"/><text x="135" y="112" font-size="16" font-family="Georgia,serif" font-style="italic" fill="#fff" text-anchor="middle" opacity=".75">∫</text>
      <g transform="rotate(16 168 150)"><rect x="154" y="58" width="26" height="92" rx="3" fill="#D8B9A5"/><rect x="159" y="72" width="16" height="4" rx="2" fill="#fff" opacity=".5"/></g>`;
    },
    lamp() {
      const g = "lg" + ++uid;
      return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#FFE6AE" stop-opacity=".95"/><stop offset="1" stop-color="#FFE6AE" stop-opacity="0"/></radialGradient></defs>
      <circle cx="120" cy="98" r="76" fill="url(#${g})"/>${sh(120, 154, 60)}
      <path d="M90 36h60l20 54H70z" fill="#EAD3AC"/><path d="M90 36h12l-12 54H70z" fill="#F4E4C6"/><ellipse cx="120" cy="90" rx="50" ry="6" fill="#D2B585"/>
      <rect x="116" y="90" width="8" height="48" fill="#6F8067"/><rect x="84" y="136" width="72" height="12" rx="6" fill="#4F6A43"/>`;
    },
    pots() {
      return `${sh(124, 156, 96)}
      <rect x="40" y="90" width="18" height="9" rx="4.5" fill="#5E6B59"/><rect x="142" y="90" width="18" height="9" rx="4.5" fill="#5E6B59"/>
      <rect x="54" y="76" width="92" height="74" rx="14" fill="#8E9C88"/><rect x="64" y="88" width="9" height="48" rx="4.5" fill="#fff" opacity=".18"/>
      <ellipse cx="100" cy="76" rx="51" ry="10" fill="#A9B5A2"/><rect x="91" y="60" width="18" height="11" rx="4" fill="#5E6B59"/>
      <g transform="rotate(-10 196 128)"><rect x="196" y="122" width="40" height="8" rx="4" fill="#3F4A3B"/></g>
      <ellipse cx="172" cy="134" rx="34" ry="13" fill="#5E6B59"/><ellipse cx="172" cy="130" rx="29" ry="9" fill="#7A8874"/>`;
    },
    boots() {
      const b = (dx, dy, c) => `<g transform="translate(${dx} ${dy})"><path d="M0 0h34v62q0 8 8 10l22 6q10 3 10 14v8H0z" fill="${c}"/><rect x="-2" y="-6" width="38" height="13" rx="5" fill="#EBDDC8"/><rect x="0" y="96" width="74" height="8" rx="3" fill="#4A372A"/><path d="M8 30h18M8 42h18" stroke="#000" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/></g>`;
      return `${sh(124, 156, 84)}${b(52, 46, "#8A6446")}${b(116, 52, "#9A7353")}`;
    },
    baby() {
      return `${sh(120, 156, 78)}
      <path d="M92 40q28 16 56 0l30 18-12 24-14-6v52q0 22-20 22h-24q-20 0-20-22V76l-14 6-12-24z" fill="#EAD9C4"/>
      <path d="M100 42q20 18 40 0" stroke="#D3BC9F" stroke-width="4" fill="none"/>
      <circle cx="110" cy="140" r="3" fill="#C9AE8C"/><circle cx="120" cy="142" r="3" fill="#C9AE8C"/><circle cx="130" cy="140" r="3" fill="#C9AE8C"/>
      <path d="M108 92q12 10 24 0" stroke="#A8B69A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M180 112h14v26q0 8-8 8h-12q-8 0-8-7t8-7h6z" fill="#A8B69A"/><path d="M196 104h12v28q0 8-8 8h-6" fill="#8FA382"/>`;
    },
    blanket() {
      const st = (x, y, w, h) => `<rect x="${x}" y="${y + h * 0.3}" width="${w}" height="5" fill="#EFE9DC" opacity=".85"/><rect x="${x}" y="${y + h * 0.62}" width="${w}" height="5" fill="#EFE9DC" opacity=".85"/><rect x="${x + w * 0.3}" y="${y}" width="5" height="${h}" fill="#EFE9DC" opacity=".55"/><rect x="${x + w * 0.66}" y="${y}" width="5" height="${h}" fill="#EFE9DC" opacity=".55"/>`;
      return `${sh(120, 156, 90)}
      <rect x="44" y="98" width="152" height="52" rx="13" fill="#A8B69A"/>${st(44, 98, 152, 52)}
      <rect x="54" y="56" width="132" height="46" rx="13" fill="#8FA382"/>${st(54, 56, 132, 46)}
      <path d="M196 108v34M200 110v30" stroke="#8FA382" stroke-width="2.5" stroke-dasharray="3 3"/>`;
    },
    box() {
      return `${sh(120, 156, 70)}<rect x="70" y="60" width="100" height="90" rx="8" fill="#D8B9A5"/><path d="M70 84h100" stroke="#C4A28C" stroke-width="3"/><path d="M110 60v24h20V60" fill="#C4A28C"/>`;
    },
  };
  function item(k) {
    return `<svg viewBox="0 0 240 180" class="ill" aria-hidden="true" focusable="false">${(I[k] || I.box)()}</svg>`;
  }

  /* ---------- Brand + scene art ---------- */
  function logo(heart) {
    return `<svg viewBox="0 0 64 46" class="logo" aria-hidden="true" focusable="false">
      <path d="M32 15v-3.2c0-1.6 1-2.4 2.3-3.2 2.2-1.4 3.2-2.6 3.2-4.3a5.5 5.5 0 0 0-11 .3" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M32 15 5.3 35c-2.3 1.7-1.3 4.2 1.5 4.2h50.4c2.8 0 3.8-2.5 1.5-4.2z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M32 33.2l-5-4.9a3.2 3.2 0 0 1 5-3.9 3.2 3.2 0 0 1 5 3.9z" fill="none" stroke="${heart || "currentColor"}" stroke-width="2.3" stroke-linejoin="round"/></svg>`;
  }
  function welcome() {
    return `<svg viewBox="0 0 260 200" aria-hidden="true" focusable="false">
      <ellipse cx="140" cy="186" rx="110" ry="9" fill="#4a3b26" opacity=".08"/>
      <path d="M44 150c-6-26 0-58 22-80" stroke="#7E9A62" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="54" cy="84" rx="15" ry="7" fill="#7E9A62" transform="rotate(-40 54 84)"/><ellipse cx="72" cy="70" rx="14" ry="6.5" fill="#8FAA70" transform="rotate(-70 72 70)"/><ellipse cx="38" cy="108" rx="14" ry="6.5" fill="#8FAA70" transform="rotate(-10 38 108)"/><ellipse cx="60" cy="110" rx="12" ry="6" fill="#6F8067" transform="rotate(-60 60 110)"/>
      <path d="M196 70l-15-14.5a9.6 9.6 0 0 1 15-11.7 9.6 9.6 0 0 1 15 11.7z" fill="none" stroke="#B67B4C" stroke-width="4.5" stroke-linejoin="round" class="w-heart"/>
      <path d="M76 106h132v-8H76z" fill="#C9A684"/>
      <rect x="96" y="76" width="96" height="16" rx="6" fill="#D9A15F"/><rect x="90" y="88" width="106" height="16" rx="6" fill="#E8C68E"/><rect x="100" y="64" width="84" height="15" rx="6" fill="#C98E5A"/>
      <path d="M70 104h144v78H70z" fill="#EBD7BE"/><path d="M70 104h144v14H70z" fill="#E1C9AB"/>
      <path d="M70 104 52 128h40l14-24z" fill="#F2E3CF"/><path d="M214 104l18 24h-40l-14-24z" fill="#DDC2A2"/>
      <path d="M70 182h144" stroke="#D4BB9C" stroke-width="2"/></svg>`;
  }
  function hero() {
    return `<svg viewBox="0 0 170 130" aria-hidden="true" focusable="false">
      <path d="M128 130c-2-40 4-80 22-118" stroke="#5E7653" stroke-width="2.5" fill="none"/>
      <ellipse cx="146" cy="30" rx="13" ry="5" fill="#6F8067" transform="rotate(-55 146 30)"/><ellipse cx="132" cy="52" rx="13" ry="5" fill="#8FA382" transform="rotate(-20 132 52)"/><ellipse cx="152" cy="62" rx="12" ry="5" fill="#6F8067" transform="rotate(-70 152 62)"/><ellipse cx="128" cy="80" rx="12" ry="5" fill="#8FA382" transform="rotate(-10 128 80)"/><ellipse cx="160" cy="16" rx="10" ry="4.5" fill="#8FA382" transform="rotate(-80 160 16)"/>
      <path d="M92 64V50q16-22 32 0v14" stroke="#C4A587" stroke-width="5" fill="none"/>
      <path d="M78 64h60l6 66H72z" fill="#D8B9A5"/>
      <path d="M52 74V58q17-24 34 0v16" stroke="#D6C3A3" stroke-width="5" fill="none"/>
      <path d="M38 74h62l6 56H32z" fill="#F2E9D9"/><path d="M38 74h62l1 8H37z" fill="#E6D9C2"/></svg>`;
  }

  /* ---------- Neighborhood map (stylized Kadıköy) ---------- */
  const CAT_COLOR = { food: "#B9693B", clothing: "#4F6A43", books: "#8A7444", household: "#5C7B73" };
  function map(items, sel, you) {
    const pins = items.map((it) => {
      const on = it.id === sel;
      return `<g class="pin${on ? " on" : ""}" data-act="pin" data-id="${it.id}" transform="translate(${it.x} ${it.y}) scale(${on ? 1.3 : 1})"><path d="M0 0C-4-9-14-14-14-24a14 14 0 1 1 28 0C14-14 4-9 0 0z" fill="${CAT_COLOR[it.cat] || "#4F6A43"}" stroke="#fff" stroke-width="2"/><circle cy="-24" r="5.5" fill="#fff"/></g>`;
    }).join("");
    const lbl = (x, y, t) => `<text x="${x}" y="${y}" class="m-lbl">${t}</text>`;
    return `<svg viewBox="0 0 390 600" preserveAspectRatio="xMidYMid slice" class="map-svg" role="img" aria-label="Map of donations in Kadıköy">
      <rect width="390" height="600" fill="#ECE6D8"/>
      <g fill="#E4DDCC">
        <rect x="70" y="90" width="60" height="40" rx="6"/><rect x="200" y="96" width="70" height="44" rx="6"/><rect x="250" y="250" width="60" height="50" rx="6"/><rect x="90" y="250" width="50" height="40" rx="6"/><rect x="260" y="360" width="70" height="40" rx="6"/><rect x="190" y="390" width="40" height="50" rx="6"/>
      </g>
      <path d="M0 0h38c14 80 22 160 10 240-8 60-18 110-2 160 14 50 64 80 114 92 30 6 45-7 55 8 10 20 35 45 75 60H0z" fill="#CBD9D3"/>
      <path d="M290 600c10-15 40-25 100-30v30z" fill="#CBD9D3"/>
      <path d="M58 300q28-24 52-4 12 30-18 44-34 4-34-40z" fill="#D5DFC6"/><path d="M216 520q20-16 40 0t-8 30q-30 4-32-30z" fill="#D5DFC6"/><path d="M300 150q24-10 36 8-4 24-26 22-14-8-10-30z" fill="#D5DFC6"/>
      <g stroke="#F8F5EE" stroke-width="5" fill="none" stroke-linecap="round">
        <path d="M60 140h330M70 190l320 10M54 280l336 20M60 360h330M70 420l320-10M120 40v460M210 40l10 470M270 60l20 420M340 40v420M90 470l130-120M200 330l120-140"/>
      </g>
      <g stroke="#FFFFFF" stroke-width="11" fill="none" stroke-linecap="round">
        <path d="M30 72c110-10 230-22 370-30"/><path d="M58 232c90 8 190 26 342 70"/><path d="M160 60c8 140 14 280 18 420"/><path d="M196 482c70-12 130-20 204-24"/>
      </g>
      ${lbl(84, 128, "RASİMPAŞA")}${lbl(190, 160, "OSMANAĞA")}${lbl(300, 92, "KOŞUYOLU")}${lbl(300, 236, "ACIBADEM")}${lbl(176, 274, "CAFERAĞA")}${lbl(78, 470, "MODA")}${lbl(290, 412, "GÖZTEPE")}${lbl(224, 572, "FENERBAHÇE")}
      <text x="22" y="330" class="m-sea" transform="rotate(-80 22 330)">MARMARA</text>
      <g transform="translate(${you ? you[0] : 165} ${you ? you[1] : 350})"><circle r="30" class="you-pulse" fill="#4F6A43" opacity=".14"/><circle r="15" fill="#4F6A43" opacity=".16"/><circle r="7" fill="#4F6A43" stroke="#fff" stroke-width="3"/></g>
      ${pins}</svg>`;
  }

  return { icon, item, logo, welcome, hero, map, CAT_COLOR };
})();
