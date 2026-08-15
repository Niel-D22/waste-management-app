import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

// Ikon-ikon di bawah di-reuse persis dari FloatingIcons.jsx (circle fill +
// path "d" sama persis, tidak diubah) supaya identitas visualnya konsisten
// dengan hero section yang sudah ada. Tiap ikon aslinya digambar di atas
// satu kanvas besar (lihat FloatingIcons.jsx) dengan lingkaran cx/cy unik —
// di sini viewBox di-set otomatis mengikuti cx/cy asli itu (viewBox =
// [cx-45, cy-45, 90, 90]) supaya path TIDAK perlu di-translate manual sama
// sekali (translate manual rawan salah hitung & bikin ikon geser/kepotong).
const ICONS = [
  {
    id: "handshake",
    color: "#910096",
    cx: 469.1,
    cy: 56.1,
    paths: [
      "M470.985 50.021L468.604 52.404L466.772 54.236C466.552 54.458 466.289 54.635 466 54.755C465.711 54.875 465.401 54.937 465.088 54.936C464.775 54.935 464.465 54.872 464.176 54.751C463.888 54.629 463.626 54.452 463.407 54.228C463.187 54.005 463.015 53.74 462.899 53.449C462.783 53.158 462.725 52.847 462.73 52.534C462.736 52.221 462.803 51.912 462.928 51.625C463.054 51.338 463.235 51.079 463.462 50.863L468.906 45.619C468.994 45.535 469.085 45.455 469.178 45.38C469.775 45.994 470.242 46.72 470.553 47.518C470.863 48.315 471.011 49.166 470.986 50.022M483.282 67.236L482.194 68.72C481.607 69.52 480.84 70.17 479.955 70.618C479.07 71.066 478.092 71.3 477.1 71.3L476.21 72.19C475.301 73.1 474.084 73.637 472.8 73.695C471.515 73.753 470.255 73.329 469.267 72.506L468.3 71.7L467.738 72.262C467.156 72.845 466.464 73.307 465.702 73.622C464.941 73.938 464.124 74.1 463.3 74.1C462.476 74.1 461.66 73.938 460.898 73.622C460.136 73.307 459.445 72.845 458.862 72.262L452.838 66.238C452.54 65.94 452.188 65.705 451.799 65.544C451.411 65.383 450.995 65.3 450.574 65.3H440.3V47.7H450.174C450.595 47.7 451.011 47.617 451.399 47.456C451.788 47.296 452.14 47.06 452.438 46.762L455.226 43.974C455.82 43.38 456.526 42.909 457.302 42.587C458.079 42.266 458.911 42.1 459.751 42.1H463.249C463.95 42.1 464.64 42.215 465.292 42.435L460.132 47.405C459.438 48.058 458.881 48.843 458.494 49.715C458.107 50.586 457.898 51.526 457.879 52.479C457.86 53.432 458.031 54.38 458.383 55.266C458.735 56.152 459.26 56.959 459.928 57.639C460.595 58.32 461.392 58.86 462.272 59.228C463.151 59.597 464.095 59.786 465.048 59.785C466.002 59.784 466.945 59.593 467.824 59.222C468.702 58.852 469.498 58.31 470.164 57.628L470.498 57.294L483.226 67.194L483.28 67.234",
      "M488.026 47.7H497.9V65.3H484.7L470.3 54.1L468.468 55.932C468.024 56.381 467.495 56.736 466.912 56.979C466.329 57.221 465.704 57.345 465.073 57.344C464.442 57.342 463.817 57.215 463.235 56.97C462.653 56.725 462.126 56.367 461.684 55.917C461.242 55.466 460.894 54.932 460.66 54.346C460.426 53.76 460.311 53.133 460.321 52.502C460.331 51.871 460.467 51.248 460.72 50.67C460.974 50.091 461.339 49.569 461.796 49.134L467.241 43.89C468.434 42.741 470.025 42.1 471.681 42.1H478.449C479.289 42.1 480.122 42.266 480.898 42.587C481.675 42.909 482.38 43.38 482.974 43.974L485.762 46.762C486.06 47.06 486.412 47.296 486.801 47.456C487.189 47.617 487.605 47.7 488.026 47.7Z",
    ],
  },
  {
    id: "leaf",
    color: "#2E7D32",
    cx: 331.1,
    cy: 115.1,
    paths: [
      "M344.433 103.433C320.433 108.767 314.833 125.22 309.287 139.007L314.327 140.767L316.86 134.633C318.14 135.087 319.473 135.433 320.433 135.433C349.767 135.433 357.767 90.1 357.767 90.1C355.1 95.433 336.433 96.1 323.1 98.767C309.767 101.433 304.433 112.767 304.433 118.1C304.433 123.433 309.1 128.1 309.1 128.1C317.767 103.433 344.433 103.433 344.433 103.433Z",
    ],
  },
  {
    id: "chart",
    // Dulu #FFDB6F + noBaseCircle: glyph kuning pucat tanpa lingkaran, berdiri
    // langsung di atas latar biru muda — praktis tak terlihat. Sekarang diberi
    // lingkaran amber seperti ikon lain, glyph-nya putih.
    color: "#E09112",
    cx: 520.1,
    cy: 169.1,
    paths: [
      "M500.1 188.1C499.572 188.093 499.067 187.88 498.694 187.507C498.32 187.133 498.107 186.628 498.1 186.1V146.1C498.107 145.572 498.32 145.067 498.694 144.693C499.067 144.32 499.572 144.107 500.1 144.1C500.628 144.107 501.133 144.32 501.507 144.693C501.88 145.067 502.093 145.572 502.1 146.1V186.1C502.093 186.628 501.88 187.133 501.507 187.507C501.133 187.88 500.628 188.093 500.1 188.1Z",
      "M540.1 188.1H500.1C499.57 188.1 499.061 187.889 498.686 187.514C498.311 187.139 498.1 186.63 498.1 186.1C498.1 185.57 498.311 185.061 498.686 184.686C499.061 184.311 499.57 184.1 500.1 184.1H540.1C540.63 184.1 541.139 184.311 541.514 184.686C541.889 185.061 542.1 185.57 542.1 186.1C542.1 186.63 541.889 187.139 541.514 187.514C541.139 187.889 540.63 188.1 540.1 188.1ZM525.433 173.433C525.171 173.435 524.91 173.383 524.668 173.283C524.425 173.182 524.205 173.034 524.02 172.847L517.433 166.26L510.847 172.847C510.468 173.2 509.966 173.392 509.448 173.383C508.93 173.374 508.436 173.164 508.069 172.798C507.703 172.431 507.493 171.937 507.484 171.419C507.474 170.901 507.667 170.399 508.02 170.02L516.02 162.02C516.395 161.645 516.903 161.435 517.433 161.435C517.963 161.435 518.472 161.645 518.847 162.02L525.433 168.607L534.687 159.353C535.066 159 535.567 158.808 536.085 158.817C536.604 158.826 537.098 159.036 537.464 159.402C537.831 159.769 538.041 160.263 538.05 160.781C538.059 161.299 537.867 161.801 537.513 162.18L526.847 172.847C526.662 173.034 526.442 173.182 526.199 173.283C525.957 173.383 525.696 173.435 525.433 173.433Z",
      "M537.433 171.007C536.905 171 536.4 170.787 536.027 170.413C535.653 170.04 535.44 169.535 535.433 169.007V161.433H528.1C527.57 161.433 527.061 161.223 526.686 160.848C526.311 160.472 526.1 159.964 526.1 159.433C526.1 158.903 526.311 158.394 526.686 158.019C527.061 157.644 527.57 157.433 528.1 157.433H537.433C537.962 157.44 538.466 157.653 538.84 158.027C539.214 158.4 539.427 158.905 539.433 159.433V169.007C539.427 169.535 539.214 170.04 538.84 170.413C538.466 170.787 537.962 171 537.433 171.007Z",
    ],
  },
  {
    id: "recycle",
    color: "#B12E0A",
    cx: 394.1,
    cy: 215.1,
    paths: [
      "M399.873 187.767C397.308 183.321 390.892 183.321 388.327 187.767L384.601 194.22C384.079 195.138 383.942 196.226 384.218 197.245C384.495 198.264 385.164 199.133 386.079 199.661C386.993 200.189 388.08 200.334 389.101 200.064C390.122 199.794 390.995 199.131 391.529 198.22L394.1 193.767L400.02 204.023C399.086 204.112 398.212 204.526 397.553 205.194C396.893 205.862 396.49 206.74 396.412 207.676C396.335 208.611 396.589 209.544 397.13 210.311C397.671 211.078 398.465 211.63 399.372 211.871L407.1 213.94C407.68 214.099 408.288 214.124 408.878 214.013C409.469 213.902 410.026 213.657 410.508 213.297C411.239 212.759 411.756 212.017 412.001 211.111L414.071 203.385C414.314 202.48 414.231 201.517 413.837 200.666C413.443 199.816 412.763 199.13 411.915 198.73C411.067 198.33 410.105 198.24 409.198 198.477C408.29 198.714 407.495 199.262 406.951 200.025L399.873 187.767ZM367.543 223.767L374.617 211.511C373.683 211.422 372.81 211.007 372.15 210.339C371.491 209.672 371.087 208.793 371.01 207.858C370.932 206.922 371.187 205.99 371.728 205.223C372.269 204.456 373.062 203.904 373.969 203.663L381.697 201.593C382.722 201.321 383.812 201.466 384.73 201.995C385.648 202.525 386.319 203.397 386.596 204.42L388.668 212.151C388.911 213.056 388.829 214.019 388.435 214.87C388.041 215.72 387.36 216.406 386.512 216.806C385.664 217.206 384.702 217.296 383.795 217.059C382.888 216.822 382.092 216.274 381.548 215.511L375.625 225.767H380.767C381.828 225.767 382.845 226.188 383.595 226.938C384.345 227.688 384.767 228.706 384.767 229.767C384.767 230.828 384.345 231.845 383.595 232.595C382.845 233.345 381.828 233.767 380.767 233.767H373.316C368.183 233.767 364.977 228.212 367.543 223.767ZM416.932 217.313C416.398 216.402 415.525 215.739 414.504 215.469C413.483 215.199 412.396 215.344 411.481 215.872C410.566 216.4 409.898 217.269 409.621 218.288C409.344 219.308 409.482 220.395 410.004 221.313L412.575 225.767H400.735C401.125 224.913 401.202 223.95 400.954 223.045C400.705 222.14 400.146 221.351 399.375 220.817C398.604 220.282 397.669 220.036 396.734 220.121C395.8 220.206 394.925 220.617 394.263 221.281L388.625 226.919C387.889 227.644 387.433 228.652 387.433 229.767C387.433 230.865 387.86 231.863 388.625 232.617L394.263 238.252C394.925 238.915 395.8 239.324 396.733 239.408C397.667 239.492 398.6 239.245 399.371 238.711C400.141 238.177 400.699 237.39 400.948 236.486C401.197 235.582 401.12 234.62 400.732 233.767H414.884C420.017 233.767 423.225 228.212 420.657 223.767L416.932 217.313Z",
    ],
  },
  {
    id: "location",
    color: "#002D56",
    cx: 556.1,
    cy: 277.1,
    paths: [
      "M555.852 276.019C554.086 276.019 552.393 275.317 551.145 274.069C549.897 272.821 549.195 271.128 549.195 269.363C549.195 267.597 549.897 265.904 551.145 264.656C552.393 263.408 554.086 262.706 555.852 262.706C557.617 262.706 559.31 263.408 560.558 264.656C561.807 265.904 562.508 267.597 562.508 269.363C562.508 270.237 562.336 271.102 562.001 271.91C561.667 272.717 561.176 273.451 560.558 274.069C559.94 274.687 559.206 275.178 558.399 275.512C557.591 275.847 556.726 276.019 555.852 276.019ZM555.852 250.725C550.909 250.725 546.168 252.689 542.673 256.184C539.178 259.679 537.214 264.42 537.214 269.363C537.214 283.341 555.852 303.975 555.852 303.975C555.852 303.975 574.489 283.341 574.489 269.363C574.489 264.42 572.526 259.679 569.03 256.184C565.535 252.689 560.795 250.725 555.852 250.725Z",
    ],
  },
  {
    id: "community",
    color: "#000000",
    cx: 121.1,
    cy: 323.1,
    paths: [
      "M111.1 305.1C111.1 302.448 112.154 299.904 114.029 298.029C115.904 296.154 118.448 295.1 121.1 295.1C123.752 295.1 126.296 296.154 128.171 298.029C130.047 299.904 131.1 302.448 131.1 305.1C131.1 307.752 130.047 310.296 128.171 312.171C126.296 314.046 123.752 315.1 121.1 315.1C118.448 315.1 115.904 314.046 114.029 312.171C112.154 310.296 111.1 307.752 111.1 305.1ZM115.1 319.1C113.509 319.1 111.983 319.732 110.857 320.857C109.732 321.983 109.1 323.509 109.1 325.1V335.1C109.1 338.283 110.364 341.335 112.615 343.585C114.865 345.836 117.917 347.1 121.1 347.1C124.283 347.1 127.335 345.836 129.585 343.585C131.836 341.335 133.1 338.283 133.1 335.1V325.1C133.1 323.509 132.468 321.983 131.343 320.857C130.218 319.732 128.691 319.1 127.1 319.1H115.1ZM105.324 322.98C105.174 323.677 105.099 324.387 105.1 325.1V335.1C105.1 337.241 105.529 339.36 106.362 341.332C107.196 343.304 108.416 345.088 109.952 346.58L109.552 346.692C106.479 347.514 103.205 347.082 100.45 345.492C97.6947 343.901 95.6841 341.281 94.8601 338.208L93.3041 332.408C93.1003 331.647 93.0483 330.853 93.1513 330.072C93.2543 329.291 93.5101 328.537 93.9042 327.855C94.2983 327.173 94.8229 326.575 95.4482 326.095C96.0734 325.616 96.7869 325.264 97.5481 325.06L105.324 322.98ZM132.244 346.58C133.78 345.089 135.002 343.304 135.836 341.332C136.67 339.36 137.1 337.241 137.1 335.1V325.1C137.097 324.369 137.023 323.663 136.876 322.98L144.648 325.06C145.41 325.264 146.124 325.616 146.749 326.095C147.375 326.575 147.9 327.174 148.294 327.856C148.688 328.539 148.944 329.293 149.046 330.075C149.149 330.856 149.097 331.651 148.892 332.412L147.34 338.208C146.923 339.764 146.198 341.219 145.206 342.489C144.215 343.758 142.978 344.814 141.57 345.596C140.162 346.377 138.611 346.867 137.009 347.036C135.408 347.205 133.784 347.05 132.244 346.58ZM93.1001 311.1C93.1001 308.978 93.9429 306.943 95.4432 305.443C96.9435 303.943 98.9784 303.1 101.1 303.1C103.222 303.1 105.257 303.943 106.757 305.443C108.257 306.943 109.1 308.978 109.1 311.1C109.1 313.222 108.257 315.257 106.757 316.757C105.257 318.257 103.222 319.1 101.1 319.1C98.9784 319.1 96.9435 318.257 95.4432 316.757C93.9429 315.257 93.1001 313.222 93.1001 311.1ZM133.1 311.1C133.1 308.978 133.943 306.943 135.443 305.443C136.944 303.943 138.978 303.1 141.1 303.1C143.222 303.1 145.257 303.943 146.757 305.443C148.257 306.943 149.1 308.978 149.1 311.1C149.1 313.222 148.257 315.257 146.757 316.757C145.257 318.257 143.222 319.1 141.1 319.1C138.978 319.1 136.944 318.257 135.443 316.757C133.943 315.257 133.1 313.222 133.1 311.1Z",
    ],
  },
  {
    id: "music",
    color: "#FF5722",
    cx: 382.1,
    cy: 417.1,
    paths: [
      "M373.757 404.42V418.615L398.077 425.249V397.786L373.757 404.42ZM370.557 418.615C370.557 419.317 370.788 420 371.214 420.558C371.64 421.116 372.238 421.519 372.916 421.703L397.236 428.337C397.711 428.466 398.209 428.484 398.692 428.39C399.176 428.295 399.63 428.09 400.021 427.791C400.413 427.492 400.729 427.107 400.947 426.665C401.165 426.224 401.278 425.738 401.277 425.246V397.786C401.277 397.294 401.164 396.809 400.946 396.368C400.728 395.927 400.411 395.542 400.02 395.243C399.629 394.944 399.175 394.74 398.692 394.645C398.209 394.551 397.711 394.569 397.236 394.698L372.916 401.332C372.238 401.517 371.64 401.919 371.214 402.477C370.788 403.035 370.557 403.718 370.557 404.42V418.615Z",
      "M365.159 418.86H371.7V404.78H365.15C363.494 406.753 362.588 409.246 362.59 411.822C362.591 414.397 363.501 416.889 365.159 418.86ZM371.7 422.06C372.549 422.06 373.363 421.723 373.963 421.123C374.563 420.523 374.9 419.709 374.9 418.86V404.78C374.9 403.931 374.563 403.117 373.963 402.517C373.363 401.917 372.549 401.58 371.7 401.58H364.51C364.27 401.58 364.033 401.629 363.813 401.723C363.593 401.818 363.394 401.956 363.23 402.13C358.103 407.542 358.126 416.06 363.223 421.497C363.39 421.674 363.591 421.815 363.814 421.912C364.036 422.008 364.276 422.059 364.519 422.06H371.7Z",
    ],
  },
  {
    id: "building",
    color: "#3CAB00",
    cx: 222.1,
    cy: 423.1,
    paths: [
      "M242.1 399.1H218.1C217.039 399.1 216.022 399.521 215.272 400.272C214.522 401.022 214.1 402.039 214.1 403.1V423.1H194.1C193.039 423.1 192.022 423.521 191.272 424.272C190.522 425.022 190.1 426.039 190.1 427.1V455.1H246.1V403.1C246.1 402.039 245.679 401.022 244.929 400.272C244.178 399.521 243.161 399.1 242.1 399.1ZM204.1 451.1V437.1H212.1V451.1H204.1ZM242.1 451.1H216.1V435.1C216.1 434.57 215.889 434.061 215.514 433.686C215.139 433.311 214.631 433.1 214.1 433.1H202.1C201.57 433.1 201.061 433.311 200.686 433.686C200.311 434.061 200.1 434.57 200.1 435.1V451.1H194.1V427.1H218.1V403.1H242.1V451.1Z",
      "M222.1 411.1H226.1V415.1H222.1V411.1ZM234.1 411.1H238.1V415.1H234.1V411.1ZM222.1 423.1H226.1V427.1H222.1V423.1ZM234.1 423.1H238.1V427.1H234.1V423.1ZM222.1 435.1H226.1V439.1H222.1V435.1ZM234.1 435.1H238.1V439.1H234.1V435.1Z",
    ],
  },
];

// Posisi awal di luar layar → posisi akhir yang MENGELILINGI teks, bukan
// berkumpul rapat di atasnya. Nilai dalam vw/vh supaya proporsional di berbagai
// ukuran layar. Kotak tengah (kira-kira x -22..22, y -12..12) sengaja dikosongi
// karena di situ judul dan paragrafnya berada.
// Ukurannya sengaja beda-beda supaya susunannya punya irama dan tidak terlihat
// seperti grid yang kaku.
//
// Titik BERANGKATNYA tidak ditulis lagi. Dulu tiap ikon punya koordinat
// "scatter" di luar layar dan terbang masuk. Sekarang semuanya muncul dari
// TENGAH — dari balik teks — lalu memuai ke posisinya masing-masing.
// Titik berangkat dihitung dari target dikali FAKTOR_MUNCUL, bukan nol persis:
// kalau semuanya berangkat dari satu piksel yang sama, kedelapan ikon menumpuk
// jadi satu gumpalan. Dengan dikali, tiap ikon sudah berada di ARAHNYA sendiri
// sejak awal, jadi terbaca memancar keluar dari teks.
const FAKTOR_MUNCUL = 0.07;

const LAYOUT = [
  { target: { x: -36, y: -26 }, size: 100 },
  { target: { x: -17, y: -35 }, size: 88 },
  { target: { x: 13, y: -33 }, size: 116 },
  { target: { x: 35, y: -22 }, size: 92 },
  { target: { x: -40, y: 7 }, size: 96 },
  { target: { x: 40, y: 10 }, size: 106 },
  { target: { x: -24, y: 30 }, size: 92 },
  { target: { x: 21, y: 32 }, size: 112 },
];


// Urutan langkah. Ikon lebih dulu, baru teks baris demi baris.
const LANGKAH_IKON = 1;
const LANGKAH_BARIS = [2, 3, 4];
const TOTAL_LANGKAH = 4;

// Jeda minimum antar langkah. Satu ayunan trackpad menghasilkan puluhan event
// wheel beruntun; tanpa jeda ini, satu sentakan jari akan melahap keempat
// langkah sekaligus. Inilah yang membuat "sepanjang apa pun gulungannya, tetap
// satu baris".
const JEDA_ANTAR_LANGKAH = 620;

function IconBadge({ icon, layout, index, aktif }) {
  const viewBoxMin = { x: icon.cx - 45, y: icon.cy - 45 };

  return (
    <motion.div
      className="pointer-events-auto absolute top-1/2 left-1/2"
      style={{ translateX: "-50%", translateY: "-50%" }}
      initial={false}
      animate={{
        // Titik berangkatnya dihitung dari targetnya sendiri dikali faktor
        // kecil, bukan nol persis: kalau kedelapan ikon berangkat dari satu
        // piksel yang sama mereka menumpuk jadi gumpalan. Dengan dikali, tiap
        // ikon sudah berada di ARAHNYA sendiri sejak awal, jadi terbaca
        // memancar keluar dari teks.
        x: `${aktif ? layout.target.x : layout.target.x * FAKTOR_MUNCUL}vw`,
        y: `${aktif ? layout.target.y : layout.target.y * FAKTOR_MUNCUL}vh`,
        scale: aktif ? 1 : 0.2,
        opacity: aktif ? 1 : 0,
      }}
      transition={{
        // Sengaja lambat (1,6 detik) dengan kurva yang melambat panjang di
        // ujung. Ikon yang memancar cepat terbaca seperti ledakan; yang lambat
        // terbaca seperti sesuatu yang mekar.
        // Ditambah jeda berurutan 0,14 detik per ikon, ikon terakhir baru
        // selesai sekitar 2,6 detik setelah yang pertama berangkat — jadi
        // memancarnya betul-betul terasa satu per satu.
        duration: 1.6,
        delay: aktif ? index * 0.14 : 0,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        whileHover={{ scale: 1.2, rotate: index % 2 === 0 ? 9 : -9 }}
        transition={{ type: "spring", stiffness: 320, damping: 16 }}
        className="cursor-pointer"
      >
        {/* Gerak menganggur setelah ikon menetap. Sumbu X dan Y diberi durasi
            yang BERBEDA dan bukan kelipatan satu sama lain, sehingga keduanya
            tidak pernah kembali ke titik awal bersamaan — lintasannya terasa
            mengambang acak, bukan berayun mekanis bolak-balik. */}
        <motion.div
          animate={{
            y: [0, -17, 0],
            x: index % 2 === 0 ? [0, 30, 0] : [0, -30, 0],
          }}
          transition={{
            y: {
              duration: 2.6 + index * 0.28,
              repeat: Infinity,
              ease: "easeInOut",
            },
            x: {
              duration: 4.1 + index * 0.37,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <svg
            width={layout.size}
            height={layout.size}
            viewBox={`${viewBoxMin.x} ${viewBoxMin.y} 90 90`}
            className="scale-[0.42] drop-shadow-[0_10px_24px_rgba(30,31,120,0.16)] sm:scale-[0.62] lg:scale-100"
          >
            {!icon.noBaseCircle && (
              <circle cx={icon.cx} cy={icon.cy} r="45" fill={icon.color} />
            )}
            {icon.paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={icon.noBaseCircle ? icon.color : "white"}
              />
            ))}
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function RevealLine({ aktif, className, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: aktif ? 1 : 0, y: aktif ? 0 : 44 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function IconRevealSection() {
  const sectionRef = useRef(null);
  const [langkah, setLangkah] = useState(0);

  // Disimpan juga di ref supaya penangan wheel tidak perlu didaftarkan ulang
  // tiap kali langkahnya berubah. Mendaftar ulang listener non-passive di
  // tengah gulungan bisa membuat satu event terlewat.
  const langkahRef = useRef(0);
  // Hanya pernah naik, tidak pernah turun. Ini yang menjamin apa yang sudah
  // muncul tidak pernah hilang lagi.
  const setLangkahAman = (nilai) => {
    const batas = Math.min(TOTAL_LANGKAH, Math.max(langkahRef.current, nilai));
    langkahRef.current = batas;
    setLangkah(batas);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let mendingin = false;
    let sentuhTerakhirY = 0;

    // Bagian ini mengambil alih gulungan halaman, jadi syaratnya dibuat ketat:
    // hanya aktif kalau section benar-benar sedang memenuhi layar. Di luar itu
    // gulungan dikembalikan sepenuhnya ke pengguna.
    const sedangMemenuhiLayar = () => {
      const r = el.getBoundingClientRect();
      return r.top <= 80 && r.bottom >= window.innerHeight - 80;
    };

    const maju = (turun) => {
      // Menggulung ke ATAS tidak pernah ditahan dan tidak pernah memundurkan
      // langkah. Dua alasannya:
      // 1. Apa yang sudah muncul tetap muncul — pengguna tidak melihat ikon
      //    dan teks lenyap satu per satu saat dia naik.
      // 2. Menghilangkan jebakan. Kalau ke atas juga ditahan, pengguna harus
      //    empat kali menggulung ke atas hanya untuk keluar dari section ini.
      if (!turun) return false;

      const s = langkahRef.current;
      // Semua langkah selesai: gulungan dikembalikan sepenuhnya, dan karena
      // langkahnya tidak pernah direset, melewati section ini lagi tidak akan
      // menguncinya untuk kedua kali.
      if (s >= TOTAL_LANGKAH) return false;

      if (!mendingin) {
        mendingin = true;
        setLangkahAman(s + 1);
        setTimeout(() => {
          mendingin = false;
        }, JEDA_ANTAR_LANGKAH);
      }
      return true;
    };

    const onWheel = (e) => {
      if (!sedangMemenuhiLayar()) return;
      if (maju(e.deltaY > 0)) e.preventDefault();
    };

    const onTouchStart = (e) => {
      sentuhTerakhirY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!sedangMemenuhiLayar()) return;
      const selisih = sentuhTerakhirY - e.touches[0].clientY;
      // Ambang 12px supaya sentuhan kecil yang tidak disengaja tidak dihitung
      // sebagai satu langkah.
      if (Math.abs(selisih) < 12) return;
      sentuhTerakhirY = e.touches[0].clientY;
      if (maju(selisih > 0)) e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    // Tepat setinggi layar. Panjang tambahan tidak diperlukan lagi karena
    // langkahnya tidak lagi dipetakan dari jarak gulungan — satu gerakan
    // gulung sama dengan satu langkah, sejauh apa pun jarinya bergerak.
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-(--surface-sky)"
    >
      {/* Ornamen latar. Anak PERTAMA supaya tercat paling belakang tanpa perlu
          z-index. Disembunyikan di bawah md: di layar sempit ruangnya sesak. */}
      <img
        src="/images/ornamen/ornamen-awan.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute -top-6 -left-16 hidden w-[34%] opacity-70 select-none md:block"
      />
      <img
        src="/images/ornamen/ornamen-awan.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute -right-20 bottom-4 hidden w-[28%] -scale-x-100 opacity-50 select-none md:block"
      />

      <div className="pointer-events-none absolute inset-0">
        {LAYOUT.map((layout, i) => (
          <IconBadge
            key={ICONS[i].id}
            icon={ICONS[i]}
            layout={layout}
            index={i}
            aktif={langkah >= LANGKAH_IKON}
          />
        ))}
      </div>

      {/* Ketiga baris memakai SATU ukuran font yang sama. leading-[0.92]
          membuat barisnya nyaris bersentuhan sehingga terbaca sebagai satu blok
          padat, bukan tiga kalimat yang berjauhan. */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-6">
        <h2 className="font-display text-[clamp(2.1rem,6.5vw,5rem)] leading-[0.92] font-extrabold tracking-tight text-slate-900">
          <RevealLine aktif={langkah >= LANGKAH_BARIS[0]}>
            Satu platform,
          </RevealLine>
          <RevealLine aktif={langkah >= LANGKAH_BARIS[1]}>
            banyak cara
          </RevealLine>
          <RevealLine aktif={langkah >= LANGKAH_BARIS[2]}>
            jaga lingkungan
          </RevealLine>
        </h2>
      </div>

      {/* Penanda kemajuan. Saat gulungan diambil alih, pengguna kehilangan
          satu-satunya petunjuk bahwa halaman masih merespons — titik-titik ini
          menggantikannya, sekaligus memberi tahu tinggal berapa langkah lagi. */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {Array.from({ length: TOTAL_LANGKAH }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              langkah > i ? "w-7 bg-(--primary)" : "w-1.5 bg-(--primary)/25"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default IconRevealSection;
