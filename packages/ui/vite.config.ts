import { defineConfig } from "vite";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "lib/keygate-ui.ts"),
			name: "KeygateUI",
			fileName: "keygate-ui",
		},
	},
});
