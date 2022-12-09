export interface Opts extends RequestInit {
	url: string;
	method: "get" | "post" | "put" | "delete" | "patch";
	params?: Params;
	data?: unknown;
	responseType?: string;
	headers?: Record<string, string>;
}

type Params = string | Record<string, string> | URLSearchParams | string[][] | undefined;

export interface FetcherOpts {
	baseURL?: string;
}

export const customInstance = async <T>(
	{ url, method, params, data, headers = {}, ...rest }: Opts,
	keygateOpts?: FetcherOpts,
): Promise<T> => {
	let body: BodyInit | undefined;
	if (typeof window !== "undefined" && (data instanceof URLSearchParams || data instanceof FormData)) {
		body = data;
	} else if (typeof data === "object") {
		body = JSON.stringify(data);
	}

	if (typeof data === "string") {
		body = data;
	}

	let queryStr = params ? `?${new URLSearchParams(params).toString()}` : "";
	return fetch(`${keygateOpts?.baseURL ?? ""}${url}${queryStr}`, {
		method,
		body,
		headers,
		...rest,
	}).then(async (res) => {
		if (!res.ok) {
			if (res.status === 401) {
				// useAuth.getState().logout();
			}

			// eslint-disable-next-line promise/no-return-wrap
			return Promise.reject(res);
		}

		return res.json();
	});
};

export default customInstance;
