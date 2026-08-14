"""Chatbot controller - Tanya jawab edukasi sampah"""
from flask import request
from marshmallow import ValidationError

from app.api.services.chatbot_service import ChatbotService
from app.schemas.chatbot_schema import ChatbotAskSchema
from app.utils.response import success_response, error_response


def ask():
    try:
        data = ChatbotAskSchema().load(request.get_json() or {})
    except ValidationError as err:
        return error_response(
            message="Validasi gagal",
            errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
            status_code=422
        )

    result = ChatbotService.ask(data['message'], history=data.get('history'))
    return success_response(data=result, message="Balasan chatbot berhasil diambil")
