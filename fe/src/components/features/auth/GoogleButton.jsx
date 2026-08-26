import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../../contexts/AuthContext";
import { authAPI } from "../../../services/api/routes/auth.route";
import GoogleIcon from "./GoogleIcon";

export function GoogleLoginButton({ onSuccess, onError, disabled = false }) {
  const { saveSession } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        const res = await authAPI.googleAuth({ access_token, intent: "login" });
        const { access_token: accessToken, user } = res.data.data;
        saveSession(accessToken, user);
        onSuccess?.({ user });
      } catch (err) {
        onError?.({
          message: err.response?.data?.message || "Gagal masuk dengan Google",
          status: err.response?.status,
        });
      }
    },
    onError: () => onError?.({ message: "Masuk dengan Google dibatalkan" }),
  });

  return (
    <button
      onClick={() => googleLogin()}
      disabled={disabled}
      className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      Masuk dengan Google
    </button>
  );
}

export function GoogleRegisterButton({ onSuccess, onError, disabled = false }) {
  const { saveSession } = useAuth();

  const googleRegister = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        const res = await authAPI.googleAuth({
          access_token,
          intent: "register",
        });
        const { access_token: accessToken, user } = res.data.data;
        saveSession(accessToken, user);
        onSuccess?.({ user });
      } catch (err) {
        onError?.({
          message: err.response?.data?.message || "Register Google gagal",
          status: err.response?.status,
        });
      }
    },
    onError: () => onError?.({ message: "Register Google dibatalkan" }),
  });

  return (
    <button
      onClick={() => googleRegister()}
      disabled={disabled}
      className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      Daftar dengan Google
    </button>
  );
}
