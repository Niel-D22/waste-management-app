"""Saran/masukan dari pengunjung publik"""
import uuid
from datetime import datetime, timezone

from app.config.extensions import db


class Saran(db.Model):
    __tablename__ = 'saran'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    nama = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    pesan = db.Column(db.Text, nullable=False)

    # Ditandai admin setelah dibaca. Bukan dihapus, supaya masukan lama tetap
    # bisa ditelusuri.
    sudah_dibaca = db.Column(db.Boolean, default=False, nullable=False, index=True)

    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f'<Saran {self.nama}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nama': self.nama,
            'email': self.email,
            'pesan': self.pesan,
            'sudah_dibaca': self.sudah_dibaca,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
