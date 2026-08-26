import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LuMessageCircle,
  LuX,
  LuSendHorizontal,
  LuRotateCcw,
  LuChevronRight,
  LuMapPin,
  LuFileText,
  LuRecycle,
  LuLeaf,
  LuChevronUp,
  LuChevronDown,
} from "react-icons/lu";
import { askChatbot } from "../../services/api/routes/chatbot.route";

// Wajah asisten diambil dari char-2-petugas — karakter yang sama yang berdiri
// di hero. Dipotong dari berkasnya langsung, bukan digambar ulang, jadi
// dijamin orang yang sama dan bukan sekadar mirip.
const AVATAR = "/images/chatbot/avatar-petugas.webp";

const WELCOME_MESSAGE = {
  role: "bot",
  text: "Halo! Saya Asisten Torang Bersih 🌱\nAda yang bisa saya bantu hari ini?",
};

// Topik siap pakai. Ini bukan sekadar pintasan — daftar inilah yang
// MENGUMUMKAN batas topik bot tanpa perlu menuliskan larangan.
//
// Bot kita sengaja menolak pertanyaan di luar urusan sampah. Tanpa contoh,
// pengunjung akan menebak, bertanya di luar topik, ditolak, lalu menyimpulkan
// botnya rusak. Keempatnya sengaja dipilih yang datanya memang dimiliki bot.
const TOPIK = [
  {
    label: "Lokasi bank sampah terdekat",
    tanya: "Di mana lokasi bank sampah terdekat di Sulawesi Utara?",
    Ikon: LuMapPin,
    warna: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Cara melaporkan sampah",
    tanya: "Bagaimana cara melaporkan tumpukan sampah liar lewat platform ini?",
    Ikon: LuFileText,
    warna: "bg-blue-50 text-blue-600",
  },
  {
    label: "Jenis sampah yang bisa didaur ulang",
    tanya: "Jenis sampah apa saja yang bisa didaur ulang?",
    Ikon: LuRecycle,
    warna: "bg-amber-50 text-amber-600",
  },
  {
    label: "Cara memilah sampah organik",
    tanya: "Bagaimana cara memilah sampah organik di rumah?",
    Ikon: LuLeaf,
    warna: "bg-lime-50 text-lime-600",
  },
];

// Model bahasa menjawab dalam markdown, sementara gelembung pesan kita
// menampilkan teks apa adanya — akibatnya tanda ** dan * ikut terbaca mentah
// oleh pengguna. Dibersihkan di sini, bukan dengan memasang pustaka markdown:
// jawabannya hanya berupa paragraf dan daftar bernomor, jadi seluruh pustaka
// itu cuma untuk menghapus beberapa tanda bintang.
function bersihkanMarkdown(teks = "") {
  return teks
    .replace(/\*\*(.+?)\*\*/g, "$1") // tebal
    .replace(/(^|\s)\*(?!\s)(.+?)\*/g, "$1$2") // miring
    .replace(/^#{1,6}\s+/gm, "") // judul
    .replace(/^\s*[-*]\s+/gm, "• "); // butir daftar
}

const MAX_HISTORY_SENT = 8;

// Batas pertanyaan per kunjungan. Backend sudah membatasi 12/menit dan 60/jam,
// tapi batas itu baru bekerja SETELAH permintaan sampai ke server dan memakan
// kuota Gemini. Batas di sisi ini menahannya lebih awal, dan pengunjung
// mendapat penjelasan sopan alih-alih error 429 mentah.
const MAX_PERTANYAAN = 15;

// Jeda minimum antar pertanyaan, menahan klik beruntun.
const JEDA_KIRIM_MS = 1500;

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [luas, setLuas] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [jumlahTanya, setJumlahTanya] = useState(0);
  const [gagalTerakhir, setGagalTerakhir] = useState(null);
  const scrollRef = useRef(null);
  const waktuKirimTerakhir = useRef(0);

  const kuotaHabis = jumlahTanya >= MAX_PERTANYAAN;
  const sisaKuota = MAX_PERTANYAAN - jumlahTanya;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  const kirim = async (teks) => {
    const trimmed = teks.trim();
    if (!trimmed || sending || kuotaHabis) return;

    const sekarang = Date.now();
    if (sekarang - waktuKirimTerakhir.current < JEDA_KIRIM_MS) return;
    waktuKirimTerakhir.current = sekarang;

    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setGagalTerakhir(null);
    setSending(true);
    setJumlahTanya((n) => n + 1);

    try {
      const history = nextMessages
        .filter((m) => m !== WELCOME_MESSAGE)
        .slice(-MAX_HISTORY_SENT)
        .map((m) => ({
          role: m.role === "bot" ? "model" : "user",
          text: m.text,
        }));

      const res = await askChatbot({ message: trimmed, history });
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: bersihkanMarkdown(res.data.reply) },
      ]);
    } catch (error) {
      const pesan =
        error.response?.status === 429
          ? "Terlalu banyak pertanyaan dalam waktu singkat. Tunggu sebentar, lalu coba lagi."
          : "Maaf, saya sedang tidak bisa merespons.";

      // Kegagalan yang bisa dicoba ulang TIDAK menghabiskan kuota — kalau
      // dihitung, pengguna dengan jaringan bermasalah bisa kehabisan jatah
      // tanpa pernah mendapat satu jawaban pun.
      setJumlahTanya((n) => n - 1);
      setGagalTerakhir(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: pesan, gagal: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    kirim(input);
  };

  // Topik hanya ditampilkan di awal percakapan. Setelah pengguna mulai
  // bertanya, dia sudah tahu cara pakainya — menampilkannya terus hanya
  // mempersempit ruang baca.
  const tampilkanTopik = messages.length === 1 && !sending && !kuotaHabis;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed right-6 bottom-6 z-1000 flex h-14 w-14 items-center justify-center rounded-full bg-(--primary) text-white shadow-lg transition-transform hover:scale-105 hover:bg-(--primary-dark)"
        aria-label={open ? "Tutup chatbot" : "Buka chatbot"}
      >
        {open ? <LuX size={24} /> : <LuMessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            // Di bawah sm panelnya selalu memenuhi layar. Panel kecil yang
            // melayang di layar sempit menyisakan konten di belakangnya yang
            // mengganggu fokus, dan ruang ketiknya jadi sesak.
            className={`fixed z-1000 flex flex-col overflow-hidden border-slate-200 bg-white shadow-2xl transition-[width,height,max-height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-sm:inset-0 max-sm:rounded-none sm:border ${
              luas
                ? "sm:right-6 sm:bottom-24 sm:h-[80vh] sm:max-h-[46rem] sm:w-[30rem] sm:rounded-3xl"
                : "sm:right-6 sm:bottom-24 sm:h-[70vh] sm:max-h-[36rem] sm:w-[24rem] sm:rounded-3xl"
            }`}
          >
            {/* Header putih, bukan bidang warna. Kepala percakapan yang berat
                warnanya menarik mata menjauh dari isi pesannya sendiri. */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
              <div className="relative shrink-0">
                <img
                  src={AVATAR}
                  alt=""
                  className="size-11 rounded-full bg-(--surface-sky) object-cover"
                />
                {/* Titik hijau ditempel di avatar, bukan di sebelah teks — di
                    situ dia terbaca sebagai status orangnya, bukan hiasan. */}
                <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">
                  Asisten Torang Bersih
                </p>
                <p className="text-xs text-emerald-600">Online</p>
              </div>

              {sisaKuota <= 5 && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  {Math.max(sisaKuota, 0)} tersisa
                </span>
              )}

              <button
                onClick={() => setLuas((v) => !v)}
                aria-label={luas ? "Perkecil jendela" : "Perbesar jendela"}
                className="hidden shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:block"
              >
                {luas ? <LuChevronDown size={18} /> : <LuChevronUp size={18} />}
              </button>

              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup chatbot"
                className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <LuX size={19} />
              </button>
            </div>

            {/* Pesan */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-br-md bg-(--primary) text-white"
                        : msg.gagal
                          ? "rounded-bl-md border border-amber-200 bg-amber-50 text-amber-800"
                          : "rounded-bl-md bg-slate-100 text-slate-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2">
                    <TypingDots />
                  </div>
                </div>
              )}

              {gagalTerakhir && !sending && (
                <div className="flex justify-start">
                  <button
                    onClick={() => kirim(gagalTerakhir)}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-(--primary) transition hover:bg-slate-50"
                  >
                    <LuRotateCcw size={13} />
                    Coba lagi
                  </button>
                </div>
              )}

              {tampilkanTopik && (
                <div className="space-y-2 pt-2">
                  <p className="px-1 text-xs font-bold text-slate-400">
                    Topik populer
                  </p>
                  {TOPIK.map(({ label, tanya, Ikon, warna }) => (
                    <button
                      key={label}
                      onClick={() => kirim(tanya)}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2.5 text-left transition hover:border-(--primary) hover:bg-(--primary)/4"
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${warna}`}
                      >
                        <Ikon size={16} />
                      </span>
                      <span className="flex-1 text-sm text-slate-700 group-hover:text-(--primary)">
                        {label}
                      </span>
                      <LuChevronRight
                        size={16}
                        className="shrink-0 text-slate-300 group-hover:text-(--primary)"
                      />
                    </button>
                  ))}
                </div>
              )}

              {kuotaHabis && (
                <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
                  Batas {MAX_PERTANYAAN} pertanyaan per kunjungan sudah tercapai.
                  Muat ulang halaman untuk memulai percakapan baru.
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 px-4 pt-3 pb-3">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  placeholder={
                    kuotaHabis
                      ? "Batas pertanyaan tercapai"
                      : "Ketik pertanyaanmu di sini..."
                  }
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-(--primary) disabled:bg-slate-50"
                  disabled={sending || kuotaHabis}
                />
                <button
                  type="submit"
                  disabled={sending || kuotaHabis || !input.trim()}
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-(--primary) text-white transition hover:bg-(--primary-dark) disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Kirim pesan"
                >
                  <LuSendHorizontal size={16} />
                </button>
              </form>
              <p className="mt-2 px-1 text-[11px] text-slate-400">
                Tekan Enter untuk mengirim
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatbotWidget;
