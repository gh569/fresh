import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";

export default defineConfig({
  plugins: [fresh()],
	server: {
	    // Windows / WSL 文件监听失效时开启轮询
	    watch: {
	      usePolling: true
	    },
	    hmr: true
	  }
});
