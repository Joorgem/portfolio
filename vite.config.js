// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Permite que a aplicação seja acessada por outros dispositivos na rede
    port: 5173,     // Opcional, mas garante que a porta seja 5173
  },
});