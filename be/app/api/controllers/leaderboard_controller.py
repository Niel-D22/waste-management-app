"""Leaderboard controller - Ranking kontributor aktif"""
from flask import request
from app.api.services.leaderboard_service import LeaderboardService
from app.api.services.dashboard_service import DashboardService
from app.utils.response import success_response


def get_leaderboard():
    limit = request.args.get('limit', 50, type=int)
    data = LeaderboardService.get_leaderboard(limit=limit)
    return success_response(data=data, message="Papan peringkat berhasil diambil")


def get_wilayah_leaderboard():
    # Reuse persis logic agregasi yang sama dengan Dashboard Analitik admin
    # (DashboardService.get_laporan_per_wilayah), diekspos publik di sini
    # karena papan peringkat wilayah ditampilkan di halaman publik.
    data = DashboardService.get_laporan_per_wilayah()
    return success_response(data=data, message="Papan peringkat wilayah berhasil diambil")
