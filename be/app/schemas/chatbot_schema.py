"""Chatbot validation schemas"""
from marshmallow import Schema, fields, validate


class ChatbotHistoryItemSchema(Schema):
    error_messages = {
        "unknown": "Kolom tidak dikenal"
    }
    role = fields.String(
        required=True,
        validate=validate.OneOf(['user', 'model'], error="Role harus 'user' atau 'model'"),
    )
    text = fields.String(
        required=True,
        validate=validate.Length(min=1, max=500, error="Pesan riwayat maksimal 500 karakter"),
    )


class ChatbotAskSchema(Schema):
    error_messages = {
        "unknown": "Kolom tidak dikenal"
    }
    message = fields.String(
        required=True,
        validate=validate.Length(min=1, max=500, error="Pesan harus antara 1 sampai 500 karakter"),
        error_messages={"required": "Pesan harus diisi"},
    )
    history = fields.List(
        fields.Nested(ChatbotHistoryItemSchema),
        required=False,
        load_default=list,
        validate=validate.Length(max=8, error="Riwayat percakapan maksimal 8 pesan"),
    )
