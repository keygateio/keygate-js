import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "lib/main.ts"),
			name: "KeygateAPI",
			fileName: "keygate-api",
		},
		rollupOptions: {
			external: ["node-fetch"],
			output: {},
		},
	},
});
