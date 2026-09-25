/**
 * Sumber ubin (tile) peta untuk SELURUH aplikasi.
 *
 * Kenapa bukan tile.openstreetmap.org, padahal itu yang paling gampang dipakai:
 *
 * Server ubin OpenStreetMap dijalankan sukarelawan dan punya kebijakan pemakaian
 * yang ketat. Situs ini sempat melanggarnya, dan OSM memblokir kita — petanya
 * berubah jadi kotak-kotak kuning bertuliskan "Access blocked" dengan galat 403
 * di halaman detail laporan, aset, dan kolaborator. Juri lomba menemukannya.
 *
 * Penyebab pastinya tidak bisa dipastikan dari luar — OSM memblokir tanpa
 * pemberitahuan dan tidak menyebutkan alasannya. Yang jelas melanggar dan bisa
 * diperbaiki: tidak satu pun dari 12 peta itu mencantumkan atribusi, padahal
 * kebijakan OSM mewajibkannya.
 *
 * CARTO menyediakan ubin turunan OSM yang memang ditujukan untuk dipakai
 * aplikasi web. Halaman peta utama sudah memakainya sejak awal dan tidak pernah
 * diblokir — itulah sebabnya hanya sebagian halaman yang bermasalah.
 *
 * Ditaruh di satu berkas supaya tidak ada lagi 12 salinan URL yang bisa
 * menyimpang sendiri-sendiri.
 */

// {r} diisi Leaflet dengan "@2x" di layar beresolusi tinggi, sehingga petanya
// tidak buram di ponsel modern dan layar Retina.
export const UBIN_PETA =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

/**
 * Atribusi WAJIB ditampilkan, bukan hiasan.
 *
 * Data petanya berasal dari OpenStreetMap yang berlisensi ODbL, dan lisensi itu
 * mensyaratkan penyebutan kontributornya. CARTO sebagai penyedia ubin juga
 * mensyaratkan penyebutan. Sebelumnya hanya 2 dari 15 peta di situs ini yang
 * mencantumkan atribusi, dan tidak satu pun menyebut OpenStreetMap.
 */
export const ATRIBUSI_PETA =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Atribusi lapisan alternatif di halaman peta utama (MapView).
 *
 * Dipisah karena ubinnya bukan dari CARTO maupun OpenStreetMap: menyebut
 * sumber yang salah sama saja dengan tidak menyebut sumber sama sekali.
 */
export const ATRIBUSI_GOOGLE =
  '&copy; <a href="https://www.google.com/intl/id/help/terms_maps/">Google</a>';

export const ATRIBUSI_ESRI =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';
