import { createIframeConnection, Iframe } from "./iframe";
import { createTokenKeeper } from "./tokens";

export type SyncStorageBackends = "localStorage" | "sessionStorage" | "memory";
export type AsyncStorageBackends = "indexedDB" | "secureStorage";
export type StorageBackends = SyncStorageBackends | AsyncStorageBackends;

export type KeyGateOptions<T extends StorageBackends> = {
  domain: string;
  apiKey: string;
  apiURL: string;

  /**
   * Set this to true if the keygate is running on a different top-level domain than the
   * application. This will create an iframe connection to keygate. (only works in browsers)
   * @default false
   */
  crossDomain?: true;

  /**
   * The mode of authentication, currently only "integrated" is supported
   *
   * * `integrated` - authentication is integrated into the client
   * * `external` - **not implemented yet**: authentication ui is handled by keygate server,
   *
   * @default 'integrated'
   */
  mode?: "integrated"; // | "external"

  /**
   * @description where to store the session-token
   *
   * @default 'localStorage'
   */
  storageBackend?: T;

  /**
   * A secure storage backend, should implement the same interface as localStorage.
   * If you use this, you should also set the storageBackend to `secureStorage`.
   * This is useful for frameworks like react-native, where localStorage is not secure
   */
  secureStorage?: Storage;
};

export interface KeyGate {
  fetch: typeof fetch;
  authedFetch: typeof fetch;
  // logout: () => Promise<boolean>;
  // isLoggedIn: () => Promise<boolean>;
}

/**
 * Creates a new KeyGate client
 *
 * @example
 * ```ts
 * import { createKeyGate } from "@keygate/client";
 *
 * const keygate = createKeyGate({
 *   domain: "example.com",
 *   apiKey: "my-api-key",
 *   apiURL: "https://api.keygate.dev",
 *   mode: "integrated",
 * });
 * ```
 *
 * @param options options for the client
 * @returns a KeyGate client
 */
export const createKeygateClient = <T extends StorageBackends>(
  options: KeyGateOptions<T>
): T extends AsyncStorageBackends ? Promise<KeyGate> : KeyGate => {
  const tokenKeeper = createTokenKeeper(options);
  const promise = tokenKeeper.load();
  const allowConstruct = true;

  const isBrowser = typeof window !== "undefined";

  let iframe: Iframe;
  let iframePromise: Promise<Iframe> | undefined;
  if (options.crossDomain && isBrowser)
    iframePromise = createIframeConnection(`${options.apiURL}/iframe`);

  if (typeof Worker === "undefined")
    throw new Error("KeyGate requires a browser with Web Workers");

  class KeyGateImplementation implements KeyGate {
    constructor() {
      if (!allowConstruct) {
        throw new Error("KeyGate can't be constructed");
      }
    }

    /**
     * Send a request
     * @param input The resource that you wish to fetch. Either a string containing the URL of the resource, or a `Request` object.
     * @param init An options object containing settings to be applied to the request.
     * @returns A Promise containing the response (a `Response` object).
     */
    async fetch(
      input: RequestInfo | URL,
      init: RequestInit = {}
    ): Promise<Response> {
      const opts: RequestInit = { ...init };
      const headers = new Headers(opts.headers);
      headers.set("X-KeyGate", "true");
      headers.set(
        "X-KeyGate-Origin",
        typeof window !== "undefined"
          ? window.document.location.origin
          : "unknown"
      );
      headers.set("X-KG-Key", options.apiKey);
      opts.headers = headers;
      return fetch(input, init);
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
      headers.set(
        "Authorization",
        `Bearer ${await tokenKeeper.getSessionToken()}`
      );
      opts.headers = headers;
      return this.fetch(input, init);
    }

    /**
     * Refresh the session token
     * 
     * **Note:** you should not need to call this manually, it is called automatically when needed
     */
    async refreshAccessToken() {
      if (!iframe && iframePromise) iframe = await iframePromise;

      if (options.crossDomain && isBrowser) {
        const frame = await iframePromise;
        const { token } = await iframe.postMessage<{ token: string }>(
          "refreshAccessToken"
        );
        await tokenKeeper.setSessionToken(token);
      } else {
        const resp = await this.fetch(`${options.apiURL}/api/v1/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const { token }: { token: string } = await resp.json();
        await tokenKeeper.setSessionToken(token);
      }

      return;
    }
  }

  if (promise) return promise.then(() => new KeyGateImplementation()) as any;
  return new KeyGateImplementation() as any;
};
