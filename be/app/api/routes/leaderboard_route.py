"""Leaderboard routes"""
from flask import Blueprint
from app.api.controllers import leaderboard_controller

leaderboard_bp = Blueprint('leaderboard', __name__, url_prefix='/api/leaderboard')

@leaderboard_bp.route('', methods=['GET'])
def get_leaderboard():
    return leaderboard_controller.get_leaderboard()

@leaderboard_bp.route('/wilayah', methods=['GET'])
def get_wilayah_leaderboard():
    return leaderboard_controller.get_wilayah_leaderboard()
