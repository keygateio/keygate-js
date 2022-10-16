import { createTokenKeeper } from "./tokens";
import { ClientParams, Methods, WorkerMessage } from "./types";

export type SyncStorageBackends = "localStorage" | "sessionStorage" | "memory";
export type AsyncStorageBackends = "indexedDB" | "secureStorage";
export type StorageBackends = SyncStorageBackends | AsyncStorageBackends;

export type KeyGateOptions<T extends StorageBackends> = {
  domain: string;
  apiKey: string;
  apiURL: string;

  /**
   * The mode of authentication, currently only "integrated" is supported
   *
   * * `integrated` - authentication is integrated into the client
   * * `external` - **not implemented yet**: authentication is handled by keygate server,
   *                enabling multiple clients across domains to share the same token
   *
   * @default "integrated"
   */
  mode: "integrated"; // | "external"

  /**
   * @description where to store the token
   *
   * Notes:
   * * `cookie` is not yet supported
   *
   * @default 'localStorage'
   */
  storageBackend?: T | "cookie";

  /**
   * A secure storage backend, should implement the same interface as localStorage.
   * If you use this, you should also set the storageBackend to 'secureStorage'.
   * This is useful for react-native, where localStorage is not secure
   */
  secureStorage?: Storage;

  /**
   *
   */
  csrfToken?: string;
};

export interface KeyGate {
  login: (username: string, password: string) => Promise<void>;
  fetch: typeof fetch;
  // logout: () => Promise<boolean>;
  // isLoggedIn: () => Promise<boolean>;
}

export const createKeyGate = <T extends StorageBackends>(
  options: KeyGateOptions<T>
): T extends AsyncStorageBackends ? Promise<KeyGate> : KeyGate => {
  const tokenKeeper = createTokenKeeper(options);
  const promise = tokenKeeper.load();
  const allowConstruct = true;

  if (options.storageBackend === "cookie")
    throw new Error("cookie storage backend is not yet supported");

  if (typeof Worker === "undefined")
    throw new Error("KeyGate requires a browser with Web Workers");

  class KeyGateImplementation implements KeyGate {
    constructor() {
      if (!allowConstruct) {
        throw new Error("KeyGate can't be constructed");
      }
    }

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

      if (options.storageBackend !== "cookie")
        headers.set("Authorization", `Bearer ${await tokenKeeper.getToken()}`);

      if (options.storageBackend === "cookie") opts.credentials = "include";

      if (options.csrfToken) headers.set("X-Csrf-Token", options.csrfToken);

      return this.fetch(input, init);
    }

    #send<T extends Methods>(method: T, params: ClientParams[T]) {
      return this.fetch(options.apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-KG-Key": options.apiKey,
        },
      });
    }

    async login(username: string, password: string) {
      // return this.#send("login", { username, password });
      return;
    }
  }

  if (promise) return promise.then(() => new KeyGateImplementation()) as any;
  return new KeyGateImplementation() as any;
};
