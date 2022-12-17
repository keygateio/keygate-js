import { createPublicAPI } from "@keygate/api";
import type { PublicAPI } from "@keygate/api";

import { createTokenKeeper } from "./tokens";
import { Channel } from "./channel";

import { urlAlphabet, customAlphabet } from "nanoid";
const nanoid = customAlphabet(urlAlphabet);

// XSS
// Let's get this over with.
// XSS is a security vulnerability that allows an attacker to inject malicious code into a website.
// This can be done by injecting a script tag into the DOM, or by using a URL that will execute JavaScript when opened.
// The attacker can then use this code to steal cookies, session tokens, and other sensitive information.
// This is a very common vulnerability, and it's important to know how to prevent it.
//
// Since Keygate can use localStorage, sessionStorage or memory to store the session token, we need to think about XSS.
// If we use localStorage or sessionStorage, the session token will be stored in the browser, and can be accessed by JavaScript.
// Here, if an attacker can inject a script tag into the DOM, they can access the session token directly.
// However if we use memory, the session token will be stored in memory. Direct access is harder, but not impossible.
// Our default security strategy is to use memory, and to use localStorage or sessionStorage only if the user explicitly opts in.
//
// Our default threat model is that, after XSS, a session token is pwned anyway, so all of these strategies are fine.
// You should expect to be pwned if you have XSS, and you should not rely on Keygate to protect you from XSS.
// Additionally, session tokens are short-lived, and can be revoked at any time by the server. This means that an attacker can't use a session token for a long time.
// They can only be refreshed using a refresh token, which is stored in a secure httpOnly cookie. This refresh token is not accessible to JavaScript and is not vulnerable to XSS.
// Additionally again, we use refresh token rotation, so we will detect if an attacker has stolen a refresh token and revoke it immediately.
//
// Still, access to sensitive situations should be restricted with an additional layer of security (e.g. 2FA) if you are worried about XSS.
// Plans:
// - [ ] Add WebWorker as a storage backend. This webworker will slightly decrease the attack surface for XSS.

export type SyncStorageBackends = "localStorage" | "sessionStorage" | "memory";
export type AsyncStorageBackends = "secureStorage";
export type StorageBackends = SyncStorageBackends | AsyncStorageBackends;

export type KeygateOptions<T extends StorageBackends> = {
	domain: string;
	apiKey: string;
	apiURL: string;

	/**
	 * The mode of authentication, currently only "integrated" is supported
	 *
	 * * `integrated` - authentication is integrated into the client
	 * * `external` - authentication ui is handled by keygate server,
	 *
	 * @default 'integrated'
	 */
	mode?: "integrated"; // | "external"

	/**
	 * @description where to store the session-token
	 *
	 * @default 'memory'
	 */
	storageBackend?: T;

	/**
	 * A secure storage backend, should implement the same interface as localStorage.
	 * If you use this, you should also set the storageBackend to `secureStorage`.
	 * This is useful for frameworks like react-native, where localStorage is not secure
	 */
	secureStorage?: Storage;
};

type DeviceID = string;

export interface Keygate {
	api: PublicAPI;
	deviceID: DeviceID;
	fetch: typeof fetch;
	authedFetch: typeof fetch;
	logout: () => Promise<void>;
	// isLoggedIn: () => Promise<boolean>;
}

/**
 * Creates a new Keygate client
 *
 * @example
 * ```ts
 * import { createKeygate } from "@keygate/client";
 *
 * const keygate = createKeygate({
 *   domain: "example.com",
 *   apiKey: "my-api-key",
 *   apiURL: "https://accounts.keygate.dev",
 *   mode: "integrated",
 * });
 * ```
 *
 * @param options options for the client
 * @returns a Keygate client
 */
export const createKeygateClient = <T extends StorageBackends>(
	options: KeygateOptions<T>,
): T extends AsyncStorageBackends ? Promise<Keygate> : Keygate => {
	const tokenKeeper = createTokenKeeper(options);
	const promise = tokenKeeper.load();
	const allowConstruct = true;
	const channel = new Channel("__keygate__");

	const needsFetch = typeof fetch === "undefined";
	let fetcher = !needsFetch && fetch;

	class KeygateImplementation implements Keygate {
		api = createPublicAPI({
			baseURL: options.apiURL,
		});

		#deviceID: DeviceID | undefined;
		get deviceID() {
			if (!(sessionStorage || this.#deviceID))
				console.warn("persistent deviceIDs are currently not supported in contexts without sessionStorage");

			if (this.#deviceID) {
				return this.#deviceID;
			}

			if (sessionStorage) {
				this.#deviceID = sessionStorage.getItem("kg-device-id") as DeviceID;
			}

			if (!this.#deviceID) {
				this.#deviceID = nanoid();
				sessionStorage.setItem("kg-device-id", this.#deviceID);
			}

			return this.#deviceID as DeviceID;
		}

		constructor() {
			if (!allowConstruct) {
				throw new Error("Keygate can't be constructed");
			}
			channel.onLogout(this.logout.bind(this));
		}

		/**
		 * Send a request
		 * @param input The resource that you wish to fetch. Either a string containing the URL of the resource, or a `Request` object.
		 * @param init An options object containing settings to be applied to the request.
		 * @returns A Promise containing the response (a `Response` object).
		 */
		async fetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
			const opts: RequestInit = { ...init };
			const headers = new Headers(opts.headers);
			headers.set("X-Keygate", "true");
			headers.set("X-Keygate-Origin", typeof window !== "undefined" ? window.document.location.origin : "unknown");
			headers.set("X-KG-Key", options.apiKey);
			opts.headers = headers;

			if (!fetcher) {
				if (typeof window !== "undefined") {
					fetcher = window.fetch;
				} else {
					throw new Error("`fetch` needs to be globally available");
				}
			}

			return fetcher(input, init);
		}

		/**
		 * Send an authenticated request
		 * @param input The resource that you wish to fetch. Either a string containing the URL of the resource, or a `Request` object.
		 * @param init An options object containing settings to be applied to the request.
		 * @returns A Promise containing the response (a `Response` object).
		 */
		async authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
			const opts: RequestInit = { ...init };
			const headers = new Headers(opts.headers);
			headers.set("Authorization", `Bearer ${await tokenKeeper.getSessionToken()}`);
			opts.headers = headers;
			return this.fetch(input, init);
		}

		/**
		 * Refresh the session token
		 *
		 * **Note:** you should not need to call this manually, it is called automatically when needed
		 */
		async refreshAccessToken() {
			const resp = await this.fetch(`${options.apiURL}/api/v1/refresh`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const { token }: { token: string } = await resp.json();
			await tokenKeeper.setSessionToken(token);

			return;
		}

		async logout() {
			await tokenKeeper.clearSessionToken();
			channel.logout();
		}
	}

	if (promise) {
		// rome-ignore lint/suspicious/noExplicitAny: typescript is not smart enough to infer this
		return promise.then(() => new KeygateImplementation()) as any;
	}

	// rome-ignore lint/suspicious/noExplicitAny: typescript is not smart enough to infer this
	return new KeygateImplementation() as any;
};
