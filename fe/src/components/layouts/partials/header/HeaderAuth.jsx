import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { LuUser, LuSettings, LuLogOut, LuChevronDown } from "react-icons/lu";
import { pramuat, saatMendekat } from "../../../../utils/pramuatRute";

function HeaderAuth({ isAuthenticated, user, onLogout, floating = false }) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setAvatarOpen(false);
    await onLogout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="hidden items-center lg:flex">
        {/* rounded-xl, bukan bulat penuh: sudut yang membulat sempurna di
            elemen selebar ini terbaca sebagai gaya bawaan template. Radius
            terukur dipakai konsisten di seluruh navbar dan tombol. */}
        <Link
          to="/login"
          {...saatMendekat(pramuat.login)}
          className="cursor-pointer rounded-xl bg-(--primary) px-7 py-3 text-[0.95rem] font-bold text-white shadow-lg transition hover:bg-(--primary-dark)"
        >
          Bergabung
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center lg:flex">
      <div className="relative" ref={avatarRef}>
        <button
          onClick={() => setAvatarOpen(!avatarOpen)}
          className={`flex cursor-pointer items-center gap-2.5 rounded-xl transition ${
            floating
              ? "bg-white/95 py-1.5 pr-4 pl-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur hover:bg-white"
              : "hover:ring-1 hover:ring-emerald-200"
          }`}
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-400 bg-(--primary) text-sm font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || "?"}
            </div>
          )}

          {/* Nama hanya ditampilkan di mode mengambang. Di header putih penuh,
              ruangnya lebih sempit dan avatar saja sudah cukup. */}
          {floating && (
            <>
              <span className="max-w-[9rem] truncate text-sm font-bold text-gray-800">
                {user?.username || user?.full_name || "Akun"}
              </span>
              <LuChevronDown
                size={15}
                className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                  avatarOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {avatarOpen && (
          <div className="absolute top-full right-0 z-50 mt-2 w-60 animate-[fadeIn_0.15s_ease-out] rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
            {/* User info */}
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user?.username || user?.full_name}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {user?.email}
              </p>
            </div>

            {/* Menu items */}
            {user?.role === "admin" ? (
              <Link
                to="/admin"
                onClick={() => setAvatarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-emerald-600"
              >
                <LuSettings className="h-4 w-4" />
                Panel Admin
              </Link>
            ) : (
              <Link
                to={`/${user?.username}`}
                onClick={() => setAvatarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-emerald-600"
              >
                <LuUser className="h-4 w-4" />
                Dashboard
              </Link>
            )}

            {/* Logout */}
            <div className="mt-1 border-t border-gray-100 pt-1">
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <LuLogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeaderAuth;
