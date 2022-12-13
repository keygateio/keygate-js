import * as publicAPI from "./../generated/public/api";
import { FetcherOpts } from "./fetcher";
// import * as adminAPI from "./../generated/admin/api";

const adminAPI = {
	getAdmin: (_opts: FetcherOpts): Promise<unknown> => {
		return Promise.resolve({});
	},
};

export type PublicAPI = typeof publicAPI;
export type AdminAPI = typeof adminAPI;

type KeygateAPIOptions = {
	baseURL: string;
};

type API = PublicAPI | typeof adminAPI;

const createAPIWrapper = <T extends API>(api: T) => {
	type KeygateAPI = { -readonly [K in keyof T]: T[K] };

	function createKeygateAPI(opts: KeygateAPIOptions) {
		const keygateAPI = {} as KeygateAPI;

		const override = {
			baseURL: opts.baseURL,
		};

		for (const [key, value] of Object.entries(api)) {
			if (typeof value === "function") {
				let _key = key as keyof T;

				keygateAPI[_key] = ((...args: unknown[]) => {
					// If the function only takes one argument, it's the options
					if (value.length === 1) {
						return value({ ...override, ...(args[0] as FetcherOpts) });
					}

					if (args.length > 1) {
						return value(...(args.slice(0, args.length - 1) as Parameters<typeof value>), {
							...override,
							...(args[args.length - 1] as FetcherOpts),
						});
					}

					return value(...(args as Parameters<typeof value>), override);
				}) as T[typeof _key];
			}
		}

		return keygateAPI as T;
	}

	return createKeygateAPI;
};

export const createPublicAPI = createAPIWrapper(publicAPI);
export const createAdminAPI = createAPIWrapper(adminAPI);
