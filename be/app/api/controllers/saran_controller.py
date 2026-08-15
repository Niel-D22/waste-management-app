"""Saran controller - kotak saran publik"""
from flask import request
from marshmallow import ValidationError

from app.api.services.saran_service import SaranService
from app.middlewares.auth_middleware import admin_required
from app.schemas.saran_schema import SaranCreateSchema
from app.utils.response import success_response, error_response


def create():
    try:
        data = SaranCreateSchema().load(request.get_json() or {})
    except ValidationError as err:
        return error_response(
            message="Validasi gagal",
            errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
            status_code=422
        )

    SaranService.create(data)
    # Sengaja tidak mengembalikan data saran yang baru dibuat. Endpoint ini
    # publik; membalikkan isinya berarti siapa pun bisa memakainya untuk
    # memastikan kiriman berhasil tersimpan beserta id-nya.
    return success_response(message="Terima kasih, masukanmu sudah kami terima.", status_code=201)


@admin_required
def get_all():
    return success_response(
        data=SaranService.get_all(),
        message="Daftar saran berhasil diambil"
    )
