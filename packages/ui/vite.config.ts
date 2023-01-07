/// <reference types="vite/client" />

import { defineConfig } from "vite";
import { resolve } from "node:path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
	const input =
		mode === "development"
			? {
					main: resolve(__dirname, "index.html"),
					nested: resolve(__dirname, "demo-app/index.html"),
			  }
			: "index.html";

	return {
		plugins: [process.env.VISUALIZE && visualizer()],
		build: {
			minify: true,
			lib: !process.env.PREVIEW && {
				entry: resolve(__dirname, "lib/keygate-ui.ts"),
				name: "KeygateUI",
				fileName: "keygate-ui",
				formats: ["es", "umd", "cjs"],
			},
			rollupOptions: {
				input,
			},
		},
	};
});
