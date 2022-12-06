/// <reference types="vite/client" />

import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
	const input =
		mode === "development"
			? {
					main: resolve(__dirname, "index.html"),
					nested: resolve(__dirname, "demo-app/index.html"),
			  }
			: "index.html";

	return {
		build: {
			lib: {
				entry: resolve(__dirname, "lib/keygate-ui.ts"),
				name: "KeygateUI",
				fileName: "keygate-ui",
			},
			rollupOptions: {
				input,
			},
		},
	};
});
