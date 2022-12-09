import * as publicAPI from "./../generated/public/api";
import { FetcherOpts } from "./fetcher";
// import * as adminAPI from "./../generated/admin/api";

const adminAPI = {
	getAdmin: (opts: FetcherOpts): Promise<unknown> => {
		return Promise.resolve({});
	},
};

type KeygateAPIOptions = {
	baseURL: string;
};

type API = typeof publicAPI | typeof adminAPI;

const createAPIWrapper = <T extends API>(api: T) => {
	type KeygateAPI = { -readonly [K in keyof T]: T[K] };

	function createKeygateAPI(opts: KeygateAPIOptions) {
		const keygateAPI = {} as KeygateAPI;

		for (const [key, value] of Object.entries(api)) {
			if (typeof value === "function") {
				let _key = key as keyof T;

				keygateAPI[_key] = ((...args: unknown[]) => {
					let options = args[args.length - 1] as FetcherOpts;
					let allArgs = [...args.slice(0, args.length - 1), { baseURL: opts.baseURL, ...options }];

					return value(...(allArgs as Parameters<typeof value>));
				}) as T[typeof _key];
			}
		}

		return keygateAPI as T;
	}

	return createKeygateAPI;
};

export const createPublicAPI = createAPIWrapper(publicAPI);
export const createAdminAPI = createAPIWrapper(adminAPI);
