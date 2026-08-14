"""Dashboard routes"""
from flask import Blueprint
from app.api.controllers import dashboard_controller

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/admin', methods=['GET'])
def admin_stats():
    return dashboard_controller.admin_stats()

@dashboard_bp.route('/user', methods=['GET'])
def user_stats():
    return dashboard_controller.user_stats()

@dashboard_bp.route('/admin/wilayah', methods=['GET'])
def admin_analitik_wilayah():
    return dashboard_controller.admin_analitik_wilayah()