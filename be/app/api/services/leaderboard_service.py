"""Leaderboard service - Ranking kontributor aktif Torang Bersih"""
from sqlalchemy import func

from app.config.extensions import db
from app.database.models import (
    User,
    LaporanSampahIlegal,
    TindakLanjutLaporan,
    Kolaborator, StatusVerifikasiKolaborator,
    Aset, StatusVerifikasiAset,
    Artikel, StatusPublikasi,
    MarketplaceDaurUlang,
)

POIN_LAPORAN = 10
POIN_TINDAK_LANJUT = 15
POIN_KOLABORATOR = 20
POIN_ASET = 20
POIN_ARTIKEL = 15
POIN_MARKETPLACE = 5


def _get_badge(total_poin):
    if total_poin >= 300:
        return "Legenda Torang Bersih"
    if total_poin >= 150:
        return "Pahlawan Lingkungan"
    if total_poin >= 50:
        return "Aktif"
    return "Pemula"


class LeaderboardService:

    @staticmethod
    def get_leaderboard(limit=50):
        users = User.query.filter_by(is_active=True).all()

        laporan_counts = dict(
            db.session.query(
                LaporanSampahIlegal.id_warga, func.count(LaporanSampahIlegal.id)
            ).group_by(LaporanSampahIlegal.id_warga).all()
        )
        tindak_lanjut_counts = dict(
            db.session.query(
                TindakLanjutLaporan.id_user_penindak, func.count(TindakLanjutLaporan.id)
            ).group_by(TindakLanjutLaporan.id_user_penindak).all()
        )
        kolaborator_counts = dict(
            db.session.query(
                Kolaborator.id_user, func.count(Kolaborator.id)
            ).filter(
                Kolaborator.status_verifikasi == StatusVerifikasiKolaborator.TERVERIFIKASI
            ).group_by(Kolaborator.id_user).all()
        )
        aset_counts = dict(
            db.session.query(
                Aset.id_user, func.count(Aset.id)
            ).filter(
                Aset.status_verifikasi == StatusVerifikasiAset.TERVERIFIKASI
            ).group_by(Aset.id_user).all()
        )
        artikel_counts = dict(
            db.session.query(
                Artikel.id_penulis, func.count(Artikel.id)
            ).filter(
                Artikel.status_publikasi == StatusPublikasi.PUBLISHED
            ).group_by(Artikel.id_penulis).all()
        )
        marketplace_counts = dict(
            db.session.query(
                MarketplaceDaurUlang.id_penjual, func.count(MarketplaceDaurUlang.id)
            ).group_by(MarketplaceDaurUlang.id_penjual).all()
        )

        result = []
        for user in users:
            jumlah_laporan = laporan_counts.get(user.id, 0)
            jumlah_tindak_lanjut = tindak_lanjut_counts.get(user.id, 0)
            jumlah_kolaborator = kolaborator_counts.get(user.id, 0)
            jumlah_aset = aset_counts.get(user.id, 0)
            jumlah_artikel = artikel_counts.get(user.id, 0)
            jumlah_marketplace = marketplace_counts.get(user.id, 0)

            total_poin = (
                jumlah_laporan * POIN_LAPORAN
                + jumlah_tindak_lanjut * POIN_TINDAK_LANJUT
                + jumlah_kolaborator * POIN_KOLABORATOR
                + jumlah_aset * POIN_ASET
                + jumlah_artikel * POIN_ARTIKEL
                + jumlah_marketplace * POIN_MARKETPLACE
            )

            if total_poin == 0:
                continue

            result.append({
                'user_id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'avatar_url': user.avatar_url,
                'total_poin': total_poin,
                'badge': _get_badge(total_poin),
                'jumlah_laporan': jumlah_laporan,
                'jumlah_tindak_lanjut': jumlah_tindak_lanjut,
                'jumlah_kolaborator': jumlah_kolaborator,
                'jumlah_aset': jumlah_aset,
                'jumlah_artikel': jumlah_artikel,
                'jumlah_marketplace': jumlah_marketplace,
            })

        result.sort(key=lambda x: x['total_poin'], reverse=True)
        result = result[:limit]
        for idx, item in enumerate(result, start=1):
            item['rank'] = idx

        return result
