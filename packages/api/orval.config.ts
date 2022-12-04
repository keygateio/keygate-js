let config = {
	"keygate-public-api": {
		input: "http://127.0.0.1:8080/api-doc/openapi-keygate-public-v1.json",
		output: {
			mode: "single",
			target: "./generated/public/api.ts",
			schemas: "./generated/public/model",
		},
	},
	"keygate-admin-api": {
		input: "http://127.0.0.1:8081/api-doc/openapi-keygate-admin-v1.json",
		output: {
			mode: "single",
			target: "./generated/admin/api.ts",
			schemas: "./generated/admin/model",
		},
	},
};

export default config;
