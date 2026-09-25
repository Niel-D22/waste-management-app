/**
 * Menerjemahkan kegagalan pengambilan lokasi menjadi kalimat yang bisa
 * ditindaklanjuti pengunjung.
 *
 * Latar belakangnya nyata: juri Infinitera 2.0 menulis "map akses blok waktu
 * mau buat laporan". Yang terjadi, tombol "Gunakan GPS" memanggil
 * navigator.geolocation dengan penangan galat yang hanya mematikan status
 * memuat — tanpa pesan apa pun. Saat peramban memblokir izin lokasi, tombolnya
 * berhenti berputar lalu diam. Dari sisi pemakai itu tidak bisa dibedakan dari
 * fitur yang rusak.
 *
 * Tiap pesan menyebut DUA hal: apa yang terjadi, dan apa yang bisa dilakukan
 * sekarang. Bagian kedua penting karena formulirnya tetap bisa diselesaikan
 * tanpa GPS — titik lokasi bisa ditandai langsung di peta atau dicari lewat
 * kolom alamat.
 */

// Angka kode diambil dari antarmuka GeolocationPositionError milik peramban.
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

const LANJUTAN = "Anda tetap bisa menandai titiknya langsung di peta atau mencarinya lewat kolom alamat.";

export function pesanGalatLokasi(galat) {
  switch (galat?.code) {
    case PERMISSION_DENIED:
      return `Akses lokasi diblokir peramban. Izinkan lewat ikon gembok di sebelah alamat situs, lalu coba lagi. ${LANJUTAN}`;
    case POSITION_UNAVAILABLE:
      return `Lokasi tidak dapat dideteksi perangkat ini. Pastikan GPS menyala. ${LANJUTAN}`;
    case TIMEOUT:
      return `Pendeteksian lokasi terlalu lama. Coba lagi di tempat yang sinyalnya lebih baik. ${LANJUTAN}`;
    default:
      return `Gagal mendeteksi lokasi. ${LANJUTAN}`;
  }
}

/**
 * Pilihan bawaan untuk getCurrentPosition.
 *
 * maximumAge 30 detik: kalau pengunjung menekan tombolnya dua kali berturut-turut,
 * yang kedua memakai hasil yang baru saja didapat alih-alih menyalakan GPS lagi.
 */
export const OPSI_LOKASI = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000,
};
