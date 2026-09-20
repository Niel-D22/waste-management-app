"""Environment configuration"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


def get_env(key, default=None, cast=str):
    value = os.getenv(key, default)
    if value is None:
        return None
    if cast == bool:
        return value.lower() in ('true', '1', 'yes')
    return cast(value)


class Config:
    PORT = get_env('PORT', 5000, int)
    HOST = get_env('HOST', '127.0.0.1')
    # Flask
    SECRET_KEY = get_env('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database
    SQLALCHEMY_DATABASE_URI = get_env('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/proxo_coris')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {'pool_pre_ping': True, 'pool_recycle': 300}
    
    # JWT
    JWT_SECRET_KEY = get_env('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Frontend
    FRONTEND_URL = get_env('FRONTEND_URL', 'http://localhost:5173')
    
    # CORS
    CORS_ORIGINS = get_env('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
    
    # Mail
    MAIL_SERVER = get_env('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = get_env('MAIL_PORT', 587, int)
    MAIL_USE_TLS = get_env('MAIL_USE_TLS', 'True', bool)
    MAIL_USE_SSL = get_env('MAIL_USE_SSL', 'False', bool)
    MAIL_USERNAME = get_env('MAIL_USERNAME')
    MAIL_PASSWORD = get_env('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = get_env('MAIL_DEFAULT_SENDER')

    # Resend
    RESEND_API_KEY = get_env('RESEND_API_KEY')
    MAIL_FROM = get_env('MAIL_FROM')
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME = get_env('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = get_env('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = get_env('CLOUDINARY_API_SECRET')

    # Gemini AI (Chatbot)
    GEMINI_API_KEY = get_env('GEMINI_API_KEY')

    # Rate Limiting
    RATELIMIT_DEFAULT = "10000/day;1000/hour;100/minute"
    RATELIMIT_STORAGE_URI = "memory://"
    RATELIMIT_STRATEGY = "fixed-window"
    RATELIMIT_HEADERS_ENABLED = True


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = False
    ENVIRONMENT = 'Development'


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False
    RATELIMIT_DEFAULT = "10000/day;1000/hour;100/minute"
    ENVIRONMENT = 'Production'

    # Di Vercel (variabel VERCEL diisi otomatis oleh platformnya) setiap
    # instans fungsi hidup sebentar lalu dibuang. Pool koneksi biasa akan
    # menahan koneksi yang tidak pernah dipakai lagi, dan dengan puluhan
    # instans sekaligus kuota koneksi Supabase habis dalam hitungan menit.
    # NullPool membuka koneksi per permintaan lalu langsung menutupnya —
    # pengelolaan pool diserahkan ke pooler Supabase di port 6543.
    if os.environ.get('VERCEL'):
        from sqlalchemy.pool import NullPool
        SQLALCHEMY_ENGINE_OPTIONS = {'poolclass': NullPool}
    else:
        # Server yang terus hidup (Railway, VPS). Bawaan SQLAlchemy membuka
        # hingga 15 koneksi per proses (pool 5 + luapan 10); dengan 2 worker
        # gunicorn itu 30 koneksi — dua kali lipat kuota pooler Supabase paket
        # gratis (15). Dibatasi 5 per worker: cukup untuk 4 thread per worker
        # (lihat railway.json), dan totalnya 10 tetap di bawah kuota.
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
            'pool_size': 3,
            'max_overflow': 2,
        }

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    RATELIMIT_ENABLED = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def _pastikan_rahasia_layak_produksi(cfg):
    """Menolak menyala dalam mode produksi kalau kunci rahasianya masih contoh.

    SECRET_KEY dan JWT_SECRET_KEY adalah satu-satunya hal yang memisahkan token
    login asli dari token palsu. Kalau nilainya masih kalimat contoh seperti
    "your-secret-key-here" — yang tertulis di .env.example dan di repositori
    publik — siapa pun bisa membuat token sendiri dan masuk sebagai admin tanpa
    tahu kata sandi apa pun.

    Lebih baik server gagal menyala dengan pesan yang jelas, daripada menyala
    dengan pintu yang kuncinya dibagikan ke semua orang.
    """
    tanda_contoh = ('your', 'change', 'example', 'secret-key', 'here', 'dev-')
    masalah = []
    for nama in ('SECRET_KEY', 'JWT_SECRET_KEY'):
        nilai = (getattr(cfg, nama, '') or '').lower()
        if len(nilai) < 32 or any(t in nilai for t in tanda_contoh):
            masalah.append(nama)
    if masalah:
        raise RuntimeError(
            "\n\nMode produksi ditolak: " + ", ".join(masalah) +
            " masih berupa nilai contoh atau terlalu pendek (< 32 karakter).\n"
            "Buat nilai acak baru untuk masing-masing, lalu isi di be/.env:\n\n"
            "    python -c \"import secrets; print(secrets.token_urlsafe(48))\"\n"
        )


def get_config():
    env = get_env('FLASK_ENV', 'development')
    cfg = config.get(env, config['default'])
    # Hanya dijaga di produksi. Di mesin pengembang, nilai contoh tidak apa-apa
    # dan memaksa semua anggota tim membuat kunci acak hanya memperlambat kerja.
    if cfg is ProductionConfig:
        _pastikan_rahasia_layak_produksi(cfg)
    return cfg
