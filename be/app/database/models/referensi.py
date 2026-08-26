"""Reference/Lookup tables for CRUD-able categories"""
import uuid
from datetime import datetime, timezone

from app.config.extensions import db


class RefJenisKolaborator(db.Model):
    __tablename__ = 'ref_jenis_kolaborator'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    kolaborator = db.relationship('Kolaborator', backref='jenis_ref', lazy='dynamic')

    def __repr__(self):
        return f'<RefJenisKolaborator {self.nama}>'

    def to_dict(self, include_usage=False):
        """Mengubah baris referensi menjadi dict.

        `usage_count` TIDAK dihitung secara bawaan. Angka itu butuh satu query
        COUNT tersendiri, dan to_dict() di sini ikut terpanggil setiap kali
        sebuah kategori disematkan ke dalam artikel, aset, laporan, atau barang
        daur ulang. Artinya daftar berisi 20 baris diam-diam menembakkan 20
        query COUNT hanya untuk sebuah angka yang tidak pernah ditampilkan di
        halaman-halaman itu.

        Satu-satunya layar yang benar-benar memakainya adalah pengelolaan data
        referensi di panel admin — di situ angka ini dipakai memperingatkan
        admin sebelum menonaktifkan kategori yang masih terpakai. Layar itulah
        yang meminta include_usage=True.
        """
        data = {
            'id': self.id,
            'nama': self.nama,
            'is_active': self.is_active,
        }
        if include_usage:
            data['usage_count'] = self.kolaborator.count()
        return data


class RefKategoriAset(db.Model):
    __tablename__ = 'ref_kategori_aset'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    aset = db.relationship('Aset', backref='kategori_ref', lazy='dynamic')

    def __repr__(self):
        return f'<RefKategoriAset {self.nama}>'

    def to_dict(self, include_usage=False):
        """Mengubah baris referensi menjadi dict.

        `usage_count` TIDAK dihitung secara bawaan. Angka itu butuh satu query
        COUNT tersendiri, dan to_dict() di sini ikut terpanggil setiap kali
        sebuah kategori disematkan ke dalam artikel, aset, laporan, atau barang
        daur ulang. Artinya daftar berisi 20 baris diam-diam menembakkan 20
        query COUNT hanya untuk sebuah angka yang tidak pernah ditampilkan di
        halaman-halaman itu.

        Satu-satunya layar yang benar-benar memakainya adalah pengelolaan data
        referensi di panel admin — di situ angka ini dipakai memperingatkan
        admin sebelum menonaktifkan kategori yang masih terpakai. Layar itulah
        yang meminta include_usage=True.
        """
        data = {
            'id': self.id,
            'nama': self.nama,
            'is_active': self.is_active,
        }
        if include_usage:
            data['usage_count'] = self.aset.count()
        return data


class RefJenisSampah(db.Model):
    __tablename__ = 'ref_jenis_sampah'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    laporan = db.relationship('LaporanSampahIlegal', backref='jenis_sampah_ref', lazy='dynamic')

    def __repr__(self):
        return f'<RefJenisSampah {self.nama}>'

    def to_dict(self, include_usage=False):
        """Mengubah baris referensi menjadi dict.

        `usage_count` TIDAK dihitung secara bawaan. Angka itu butuh satu query
        COUNT tersendiri, dan to_dict() di sini ikut terpanggil setiap kali
        sebuah kategori disematkan ke dalam artikel, aset, laporan, atau barang
        daur ulang. Artinya daftar berisi 20 baris diam-diam menembakkan 20
        query COUNT hanya untuk sebuah angka yang tidak pernah ditampilkan di
        halaman-halaman itu.

        Satu-satunya layar yang benar-benar memakainya adalah pengelolaan data
        referensi di panel admin — di situ angka ini dipakai memperingatkan
        admin sebelum menonaktifkan kategori yang masih terpakai. Layar itulah
        yang meminta include_usage=True.
        """
        data = {
            'id': self.id,
            'nama': self.nama,
            'is_active': self.is_active,
        }
        if include_usage:
            data['usage_count'] = self.laporan.count()
        return data


class RefKategoriBarang(db.Model):
    __tablename__ = 'ref_kategori_barang'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    marketplace_items = db.relationship('MarketplaceDaurUlang', backref='kategori_ref', lazy='dynamic')

    def __repr__(self):
        return f'<RefKategoriBarang {self.nama}>'

    def to_dict(self, include_usage=False):
        """Mengubah baris referensi menjadi dict.

        `usage_count` TIDAK dihitung secara bawaan. Angka itu butuh satu query
        COUNT tersendiri, dan to_dict() di sini ikut terpanggil setiap kali
        sebuah kategori disematkan ke dalam artikel, aset, laporan, atau barang
        daur ulang. Artinya daftar berisi 20 baris diam-diam menembakkan 20
        query COUNT hanya untuk sebuah angka yang tidak pernah ditampilkan di
        halaman-halaman itu.

        Satu-satunya layar yang benar-benar memakainya adalah pengelolaan data
        referensi di panel admin — di situ angka ini dipakai memperingatkan
        admin sebelum menonaktifkan kategori yang masih terpakai. Layar itulah
        yang meminta include_usage=True.
        """
        data = {
            'id': self.id,
            'nama': self.nama,
            'is_active': self.is_active,
        }
        if include_usage:
            data['usage_count'] = self.marketplace_items.count()
        return data


class RefKategoriArtikel(db.Model):
    __tablename__ = 'ref_kategori_artikel'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = db.Column(db.String(100), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    artikel = db.relationship('Artikel', backref='kategori_ref', lazy='dynamic')

    def __repr__(self):
        return f'<RefKategoriArtikel {self.nama}>'

    def to_dict(self, include_usage=False):
        """Mengubah baris referensi menjadi dict.

        `usage_count` TIDAK dihitung secara bawaan. Angka itu butuh satu query
        COUNT tersendiri, dan to_dict() di sini ikut terpanggil setiap kali
        sebuah kategori disematkan ke dalam artikel, aset, laporan, atau barang
        daur ulang. Artinya daftar berisi 20 baris diam-diam menembakkan 20
        query COUNT hanya untuk sebuah angka yang tidak pernah ditampilkan di
        halaman-halaman itu.

        Satu-satunya layar yang benar-benar memakainya adalah pengelolaan data
        referensi di panel admin — di situ angka ini dipakai memperingatkan
        admin sebelum menonaktifkan kategori yang masih terpakai. Layar itulah
        yang meminta include_usage=True.
        """
        data = {
            'id': self.id,
            'nama': self.nama,
            'is_active': self.is_active,
        }
        if include_usage:
            data['usage_count'] = self.artikel.count()
        return data
