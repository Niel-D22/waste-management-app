"""Validation schema untuk kotak saran publik"""
from marshmallow import Schema, fields, validate


class SaranCreateSchema(Schema):
    """Endpoint ini terbuka tanpa login, jadi setiap kolom dibatasi panjangnya.
    Tanpa batas atas, satu request bisa menitipkan teks berukuran megabyte ke
    database."""

    nama = fields.String(
        required=True,
        validate=validate.Length(min=2, max=100, error='Nama harus 2-100 karakter.'),
        error_messages={'required': 'Nama wajib diisi.'}
    )
    email = fields.Email(
        required=True,
        validate=validate.Length(max=120, error='Email maksimal 120 karakter.'),
        error_messages={'required': 'Email wajib diisi.', 'invalid': 'Format email tidak valid.'}
    )
    pesan = fields.String(
        required=True,
        validate=validate.Length(min=10, max=1000, error='Pesan harus 10-1000 karakter.'),
        error_messages={'required': 'Pesan wajib diisi.'}
    )
