"""Chatbot service - Tanya jawab edukasi sampah via Gemini AI"""
import time

from app.lib.gemini import ask_chatbot
from app.utils.exceptions import InternalServerError
from app.database.models import (
    RefJenisSampah, RefKategoriBarang, RefKategoriAset, RefJenisKolaborator,
)
from app.api.services.dashboard_service import DashboardService

_CONTEXT_CACHE_TTL_SECONDS = 60
_context_cache = {'data': None, 'expires_at': 0}


def _build_context_data():
    """Ringkasan data live dari database, disuntikkan ke chatbot supaya
    bisa jawab pertanyaan yang butuh data asli platform (bukan cuma
    pengetahuan umum soal sampah).

    Di-cache singkat (60 detik) di memori proses supaya tiap pesan chat
    tidak selalu memicu ~6 query DB baru — data ini juga tidak butuh
    real-time, jeda 1 menit tidak masalah buat kebutuhan chatbot."""
    now = time.time()
    if _context_cache['data'] is not None and _context_cache['expires_at'] > now:
        return _context_cache['data']

    wilayah_stats = DashboardService.get_laporan_per_wilayah()

    jenis_sampah = [r.nama for r in RefJenisSampah.query.filter_by(is_active=True).all()]
    kategori_barang = [r.nama for r in RefKategoriBarang.query.filter_by(is_active=True).all()]
    kategori_aset = [r.nama for r in RefKategoriAset.query.filter_by(is_active=True).all()]
    jenis_kolaborator = [r.nama for r in RefJenisKolaborator.query.filter_by(is_active=True).all()]

    per_wilayah_text = "\n".join(
        f"  - {w['kabupaten_kota']}: {w['jumlah_laporan']} laporan (dominan: {w['jenis_sampah_dominan']})"
        for w in wilayah_stats['per_wilayah']
    ) or "  (belum ada data laporan)"

    context_data = (
        "[DATA TERKINI PLATFORM TORANG BERSIH]\n"
        f"Total laporan sampah tercatat: {wilayah_stats['total_laporan']}\n"
        f"Wilayah paling aktif melapor: {wilayah_stats['wilayah_teraktif']}\n"
        f"Jenis sampah paling sering dilaporkan: {wilayah_stats['jenis_sampah_dominan_keseluruhan']}\n"
        f"Sebaran laporan per wilayah:\n{per_wilayah_text}\n"
        f"Kategori jenis sampah di sistem: {', '.join(jenis_sampah) or '-'}\n"
        f"Kategori barang daur ulang di marketplace: {', '.join(kategori_barang) or '-'}\n"
        f"Kategori aset pengelolaan sampah: {', '.join(kategori_aset) or '-'}\n"
        f"Jenis kolaborator yang terdaftar: {', '.join(jenis_kolaborator) or '-'}\n"
        "Gunakan data di atas kalau relevan dengan pertanyaan pengguna soal "
        "kondisi/statistik platform Torang Bersih. Jangan mengarang angka di "
        "luar data ini."
    )

    _context_cache['data'] = context_data
    _context_cache['expires_at'] = now + _CONTEXT_CACHE_TTL_SECONDS
    return context_data


class ChatbotService:

    @staticmethod
    def ask(message, history=None):
        context_data = _build_context_data()
        reply = ask_chatbot(message, history=history, context_data=context_data)
        if reply is None:
            raise InternalServerError(
                message="Chatbot sedang tidak bisa merespons, coba lagi sebentar lagi."
            )
        return {'reply': reply}
