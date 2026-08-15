"""Saran service - menyimpan masukan dari pengunjung publik"""
from app.config.extensions import db
from app.database.models import Saran


class SaranService:

    @staticmethod
    def create(data):
        saran = Saran(
            nama=data['nama'].strip(),
            email=data['email'].strip().lower(),
            pesan=data['pesan'].strip(),
        )
        db.session.add(saran)
        db.session.commit()
        return saran.to_dict()

    @staticmethod
    def get_all():
        """Dipakai admin. Terbaru di atas."""
        items = Saran.query.order_by(Saran.created_at.desc()).all()
        return [item.to_dict() for item in items]
