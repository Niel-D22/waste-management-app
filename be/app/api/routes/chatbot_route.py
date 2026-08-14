"""Chatbot routes"""
from flask import Blueprint
from app.api.controllers import chatbot_controller
from app.config.extensions import limiter

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')

# Rate limit sedikit di bawah kuota free-tier Gemini (15/menit) supaya
# limiter kita sendiri yang lebih dulu menahan, bukan nunggu 429 dari Google.
chatbot_limit = limiter.limit("12/minute;60/hour")

@chatbot_bp.route('/ask', methods=['POST'])
@chatbot_limit
def ask():
    return chatbot_controller.ask()
