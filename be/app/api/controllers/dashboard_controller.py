"""Dashboard controller - Statistics endpoints"""
from flask import request
from app.api.services.dashboard_service import DashboardService
from app.middlewares.auth_middleware import jwt_required_custom, admin_required
from app.utils.response import success_response


@admin_required
def admin_stats():
    stats = DashboardService.get_admin_stats()
    return success_response(data=stats, message="Statistik admin berhasil diambil")


@jwt_required_custom
def user_stats():
    stats = DashboardService.get_user_stats(request.current_user.id)
    return success_response(data=stats, message="Statistik user berhasil diambil")


@admin_required
def admin_analitik_wilayah():
    stats = DashboardService.get_laporan_per_wilayah()
    return success_response(data=stats, message="Analitik per wilayah berhasil diambil")