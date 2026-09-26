"""Dashboard service - Statistics for admin and user dashboards"""
from collections import Counter, defaultdict

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.config.extensions import db
from app.database.models import (
    Kolaborator, StatusVerifikasiKolaborator,
    Aset, StatusVerifikasiAset,
    LaporanSampahIlegal, StatusLaporan,
    TindakLanjutLaporan,
    MarketplaceDaurUlang, StatusKetersediaan,
    Artikel, StatusPublikasi,
    ArtikelLike, ArtikelKomentar,
    RefJenisSampah,
)
from app.database.models.user import User
from app.api.services.artikel_service import ArtikelService


class DashboardService:

    @staticmethod
    def get_admin_stats():
        # Dasbor ini dulu menembakkan 56 query berurutan dan butuh ±7 detik di
        # produksi. Basis datanya ada di Tokyo, jadi setiap query membayar
        # bolak-balik jaringan ±120 ms — yang mahal adalah JUMLAH query, bukan
        # isinya. Tiga sumber pemborosannya, semuanya sudah diringkas di bawah.

        # ── Totals: SATU query, bukan sembilan ──
        # Sembilan hitungan tabel yang saling lepas digabung sebagai subquery
        # skalar dalam satu SELECT.
        (
            total_users, total_kolaborator, total_aset, total_laporan,
            total_tindak_lanjut, total_marketplace, total_artikel,
            total_artikel_likes, total_artikel_komentar,
        ) = db.session.query(
            select(func.count(User.id)).scalar_subquery(),
            select(func.count(Kolaborator.id)).scalar_subquery(),
            select(func.count(Aset.id)).scalar_subquery(),
            select(func.count(LaporanSampahIlegal.id)).scalar_subquery(),
            select(func.count(TindakLanjutLaporan.id)).scalar_subquery(),
            select(func.count(MarketplaceDaurUlang.id)).scalar_subquery(),
            select(func.count(Artikel.id)).scalar_subquery(),
            select(func.count(ArtikelLike.id)).scalar_subquery(),
            select(func.count(ArtikelKomentar.id)).scalar_subquery(),
        ).one()

        # ── Rekap per status: SATU GROUP BY per tabel, bukan satu per status ──
        # Dulu perulangan `for status in Enum` menembakkan satu COUNT untuk
        # setiap nilai status (17 query). GROUP BY mengembalikan semuanya
        # sekaligus. Status yang belum punya baris tetap harus tampil sebagai
        # 0 — jadi kerangkanya tetap dibangun dari daftar enum, bukan dari
        # hasil query, dan urutan kuncinya sama seperti sebelumnya.
        def rekap(model, kolom, enum_cls):
            baris = dict(
                db.session.query(kolom, func.count(model.id)).group_by(kolom).all()
            )
            return {status.value: baris.get(status, 0) for status in enum_cls}

        laporan_per_status = rekap(
            LaporanSampahIlegal, LaporanSampahIlegal.status_laporan, StatusLaporan)
        kolaborator_per_status = rekap(
            Kolaborator, Kolaborator.status_verifikasi, StatusVerifikasiKolaborator)
        aset_per_status = rekap(
            Aset, Aset.status_verifikasi, StatusVerifikasiAset)
        marketplace_per_status = rekap(
            MarketplaceDaurUlang, MarketplaceDaurUlang.status_ketersediaan, StatusKetersediaan)
        artikel_per_status = rekap(
            Artikel, Artikel.status_publikasi, StatusPublikasi)

        # ── Item terbaru: relasi ikut dimuat, bukan dicicil satu per satu ──
        # Tanpa joinedload, to_dict() mengakses pemilik dan tabel referensi
        # dan memicu query terpisah untuk SETIAP baris (17 query untuk 15 baris).
        # Pola yang sama dipakai daftar laporan/kolaborator/artikel.
        #
        # order_by memakai DUA kolom: created_at lalu id. Data awal (seed) berisi
        # banyak baris dengan created_at yang persis sama; dengan satu kolom saja,
        # baris mana yang masuk lima teratas tidak pasti dan bisa berganti dari
        # satu permintaan ke permintaan berikutnya. id hanya berperan sebagai
        # penentu bila waktunya kembar.
        recent_laporan = LaporanSampahIlegal.query.options(
            joinedload(LaporanSampahIlegal.pelapor),
            joinedload(LaporanSampahIlegal.jenis_sampah_ref),
        ).order_by(LaporanSampahIlegal.created_at.desc(), LaporanSampahIlegal.id.desc()).limit(5).all()

        recent_kolaborator = Kolaborator.query.options(
            joinedload(Kolaborator.user),
            joinedload(Kolaborator.jenis_ref),
        ).order_by(Kolaborator.created_at.desc(), Kolaborator.id.desc()).limit(5).all()

        recent_artikel = Artikel.query.options(
            joinedload(Artikel.penulis),
            joinedload(Artikel.kategori_ref),
        ).order_by(Artikel.created_at.desc(), Artikel.id.desc()).limit(5).all()

        # Jumlah suka & komentar kelima artikel dihitung sekaligus, bukan dua
        # COUNT per artikel di dalam to_dict().
        statistik_artikel = ArtikelService.kumpulkan_statistik(recent_artikel)

        return {
            'total_users': total_users,
            'total_kolaborator': total_kolaborator,
            'total_aset': total_aset,
            'total_laporan': total_laporan,
            'total_tindak_lanjut': total_tindak_lanjut,
            'total_marketplace': total_marketplace,
            'total_artikel': total_artikel,
            'total_artikel_likes': total_artikel_likes,
            'total_artikel_komentar': total_artikel_komentar,
            'laporan_per_status': laporan_per_status,
            'kolaborator_per_status': kolaborator_per_status,
            'aset_per_status': aset_per_status,
            'marketplace_per_status': marketplace_per_status,
            'artikel_per_status': artikel_per_status,
            'recent_laporan': [item.to_dict() for item in recent_laporan],
            'recent_kolaborator': [item.to_dict() for item in recent_kolaborator],
            'recent_artikel': [item.to_dict(statistik=statistik_artikel) for item in recent_artikel],
        }

    @staticmethod
    def get_user_stats(user_id):
        # ── My counts ──
        my_kolaborator = db.session.query(func.count(Kolaborator.id)).filter(
            Kolaborator.id_user == user_id
        ).scalar()
        my_aset = db.session.query(func.count(Aset.id)).filter(
            Aset.id_user == user_id
        ).scalar()
        my_laporan = db.session.query(func.count(LaporanSampahIlegal.id)).filter(
            LaporanSampahIlegal.id_warga == user_id
        ).scalar()
        my_marketplace = db.session.query(func.count(MarketplaceDaurUlang.id)).filter(
            MarketplaceDaurUlang.id_penjual == user_id
        ).scalar()
        my_artikel = db.session.query(func.count(Artikel.id)).filter(
            Artikel.id_penulis == user_id
        ).scalar()
        my_tindak_lanjut = db.session.query(func.count(TindakLanjutLaporan.id)).filter(
            TindakLanjutLaporan.id_user_penindak == user_id
        ).scalar()
        my_likes_diberikan = db.session.query(func.count(ArtikelLike.id)).filter(
            ArtikelLike.id_user == user_id
        ).scalar()
        my_komentar = db.session.query(func.count(ArtikelKomentar.id)).filter(
            ArtikelKomentar.id_user == user_id
        ).scalar()

        # ── My laporan per status ──
        my_laporan_per_status = {}
        for status in StatusLaporan:
            count = db.session.query(func.count(LaporanSampahIlegal.id)).filter(
                LaporanSampahIlegal.id_warga == user_id,
                LaporanSampahIlegal.status_laporan == status
            ).scalar()
            my_laporan_per_status[status.value] = count

        # ── My artikel per status publikasi ──
        my_artikel_per_status = {}
        for status in StatusPublikasi:
            count = db.session.query(func.count(Artikel.id)).filter(
                Artikel.id_penulis == user_id,
                Artikel.status_publikasi == status
            ).scalar()
            my_artikel_per_status[status.value] = count

        # ── Recent activity ──
        recent_laporan = LaporanSampahIlegal.query.filter_by(
            id_warga=user_id
        ).order_by(
            LaporanSampahIlegal.created_at.desc()
        ).limit(5).all()

        recent_artikel = Artikel.query.filter_by(
            id_penulis=user_id
        ).order_by(
            Artikel.created_at.desc()
        ).limit(5).all()

        return {
            'my_kolaborator': my_kolaborator,
            'my_aset': my_aset,
            'my_laporan': my_laporan,
            'my_marketplace': my_marketplace,
            'my_artikel': my_artikel,
            'my_tindak_lanjut': my_tindak_lanjut,
            'my_likes_diberikan': my_likes_diberikan,
            'my_komentar': my_komentar,
            'my_laporan_per_status': my_laporan_per_status,
            'my_artikel_per_status': my_artikel_per_status,
            'recent_laporan': [item.to_dict() for item in recent_laporan],
            'recent_artikel': [item.to_dict() for item in recent_artikel],
        }

    @staticmethod
    def get_laporan_per_wilayah():
        rows = db.session.query(
            LaporanSampahIlegal.kabupaten_kota,
            LaporanSampahIlegal.jenis_sampah_id,
            LaporanSampahIlegal.status_laporan,
        ).filter(LaporanSampahIlegal.kabupaten_kota.isnot(None)).all()

        jenis_map = {j.id: j.nama for j in RefJenisSampah.query.all()}

        wilayah_data = defaultdict(lambda: {
            'jumlah_laporan': 0,
            'jenis_counter': Counter(),
            'status_counter': Counter(),
        })
        jenis_counter_keseluruhan = Counter()
        laporan_per_status = {status.value: 0 for status in StatusLaporan}

        for kabupaten_kota, jenis_sampah_id, status_laporan in rows:
            w = wilayah_data[kabupaten_kota]
            w['jumlah_laporan'] += 1
            if jenis_sampah_id:
                w['jenis_counter'][jenis_sampah_id] += 1
                jenis_counter_keseluruhan[jenis_sampah_id] += 1
            w['status_counter'][status_laporan] += 1
            laporan_per_status[status_laporan.value] += 1

        per_wilayah = []
        for kabupaten_kota, data in wilayah_data.items():
            dominant_jenis_id = (
                data['jenis_counter'].most_common(1)[0][0]
                if data['jenis_counter'] else None
            )
            dominant_status = (
                data['status_counter'].most_common(1)[0][0]
                if data['status_counter'] else None
            )
            per_wilayah.append({
                'kabupaten_kota': kabupaten_kota,
                'jumlah_laporan': data['jumlah_laporan'],
                'jenis_sampah_dominan': jenis_map.get(dominant_jenis_id, '-'),
                'status_terbanyak': dominant_status.value if dominant_status else '-',
            })
        per_wilayah.sort(key=lambda x: x['jumlah_laporan'], reverse=True)

        dominant_jenis_keseluruhan_id = (
            jenis_counter_keseluruhan.most_common(1)[0][0]
            if jenis_counter_keseluruhan else None
        )

        return {
            'total_laporan': len(rows),
            'wilayah_teraktif': per_wilayah[0]['kabupaten_kota'] if per_wilayah else '-',
            'jenis_sampah_dominan_keseluruhan': jenis_map.get(dominant_jenis_keseluruhan_id, '-'),
            'laporan_per_status': laporan_per_status,
            'per_wilayah': per_wilayah,
        }
