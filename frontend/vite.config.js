import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pluginRewriteAll from "vite-plugin-rewrite-all";
import genezioLocalSDKReload from "@genezio/vite-plugin-genezio";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pluginRewriteAll(), genezioLocalSDKReload()],
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
});
