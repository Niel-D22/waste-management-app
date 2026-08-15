"""Saran routes - kotak saran publik"""
from flask import Blueprint
from app.api.controllers import saran_controller
from app.config.extensions import limiter

saran_bp = Blueprint('saran', __name__, url_prefix='/api/saran')

# Dibatasi ketat karena endpoint ini terbuka tanpa login dan menulis ke
# database — tanpa batas, satu skrip bisa membanjiri tabel saran.
# 3/menit sudah lebih dari cukup untuk manusia yang mengisi formulir.
saran_limit = limiter.limit("3/minute;20/hour")


@saran_bp.route('', methods=['POST'])
@saran_limit
def create():
    return saran_controller.create()


@saran_bp.route('', methods=['GET'])
def get_all():
    return saran_controller.get_all()
