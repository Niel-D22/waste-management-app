import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", ".deadcode-backup"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Tanpa dua aturan ini, ESLint tidak menganggap pemakaian di dalam JSX
      // sebagai "pemakaian". Akibatnya `motion` yang dipakai sebagai
      // <motion.div> dilaporkan tidak terpakai, sementara komponen yang
      // sungguh-sungguh menganggur lolos begitu saja.
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",

      // varsIgnorePattern "^[A-Z_]" yang dulu dipakai memang membungkam
      // laporan palsu di atas — tapi caranya dengan mengabaikan SEMUA nama
      // berhuruf besar, yaitu persis semua komponen. Artinya `import Kartu`
      // yang tidak pernah dipakai pun tak pernah ketahuan. Setelah JSX dikenali
      // dengan benar, penyaring itu tidak diperlukan lagi.
      //
      // Yang disisakan hanya pengecualian untuk argumen yang sengaja diabaikan,
      // ditandai dengan garis bawah di depan — konvensi yang lazim dan jelas
      // maksudnya, mis. catch (_err).
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
