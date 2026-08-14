"""Gemini AI integration for Chatbot Edukasi Sampah"""
from flask import current_app
from google import genai
from google.genai import types

from app.utils.logger import logger

# gemini-flash-lite-latest dipilih (bukan gemini-2.5-flash) karena kuota
# free-tier-nya jauh lebih longgar: 15 req/menit vs 5 req/menit (dicek
# empiris langsung ke API, bukan asumsi dari dokumentasi).
MODEL_NAME = "gemini-flash-lite-latest"

SYSTEM_PROMPT = (
    "Kamu adalah asisten AI untuk platform Torang Bersih, aplikasi pengelolaan "
    "sampah untuk warga Sulawesi Utara. Kamu HANYA boleh menjawab pertanyaan "
    "seputar sampah, daur ulang, pemilahan sampah, kebersihan lingkungan, dan "
    "fitur-fitur aplikasi Torang Bersih (laporan sampah ilegal, kolaborator, "
    "aset pengelolaan sampah, marketplace barang daur ulang, artikel edukasi). "
    "Jika ditanya di luar topik tersebut, tolak dengan sopan dan arahkan "
    "kembali ke topik sampah/lingkungan. Jawab singkat, jelas, dan ramah "
    "dalam Bahasa Indonesia."
)

MAX_HISTORY_MESSAGES = 8


def _build_contents(message, history):
    contents = []
    for item in (history or [])[-MAX_HISTORY_MESSAGES:]:
        role = item.get('role')
        text = item.get('text')
        if role in ('user', 'model') and text:
            contents.append(types.Content(role=role, parts=[types.Part(text=text)]))
    contents.append(types.Content(role='user', parts=[types.Part(text=message)]))
    return contents


def ask_chatbot(message, history=None, context_data=None):
    try:
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            logger.error("GEMINI_API_KEY belum dikonfigurasi")
            return None

        system_instruction = SYSTEM_PROMPT
        if context_data:
            system_instruction = f"{SYSTEM_PROMPT}\n\n{context_data}"

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=_build_contents(message, history),
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                max_output_tokens=500,
            ),
        )
        return response.text

    except Exception as e:
        logger.error(f"Gagal memanggil Gemini API: {e}")
        return None
