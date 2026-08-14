import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LuMessageCircle, LuX, LuSendHorizontal, LuBot } from "react-icons/lu";
import { askChatbot } from "../../services/api/routes/chatbot.route";
import toaster from "../../utils/toaster";

const WELCOME_MESSAGE = {
  role: "bot",
  text: "Halo! Saya asisten Torang Bersih 🌱 Tanya apa saja soal pemilahan, daur ulang, atau pengelolaan sampah di sekitarmu.",
};

const MAX_HISTORY_SENT = 8;

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const history = nextMessages
        .filter((m) => m !== WELCOME_MESSAGE)
        .slice(-MAX_HISTORY_SENT)
        .map((m) => ({ role: m.role === "bot" ? "model" : "user", text: m.text }));

      const res = await askChatbot({ message: trimmed, history });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.reply }]);
    } catch (error) {
      toaster.error(error.response?.data?.message || "Gagal mengirim pesan ke chatbot.");
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Maaf, saya sedang tidak bisa merespons. Coba lagi sebentar lagi." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed right-6 bottom-6 z-110 flex h-14 w-14 items-center justify-center rounded-full bg-(--primary) text-white shadow-lg transition-transform hover:scale-105 hover:bg-(--primary-dark)"
        aria-label={open ? "Tutup chatbot" : "Buka chatbot"}
      >
        {open ? <LuX size={24} /> : <LuMessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed right-6 bottom-24 z-110 flex h-[70vh] max-h-140 w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-(--primary) px-4 py-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <LuBot size={20} />
              </div>
              <div>
                <p className="font-bold">Asisten Torang Bersih</p>
                <p className="text-xs text-white/70">Edukasi sampah & lingkungan</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-(--primary) text-white"
                        : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3 py-2">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Tanya soal sampah & daur ulang..."
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-(--primary)"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary) text-white transition-opacity disabled:opacity-40"
                aria-label="Kirim pesan"
              >
                <LuSendHorizontal size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatbotWidget;
