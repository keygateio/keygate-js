import { AsyncStorageBackends, KeyGateOptions, StorageBackends } from ".";
import { sha256 } from "./utils";

const isBrowser = typeof window !== "undefined";
const sessionTokenKey = "session_token";

export interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem: (key: string) => void;
  [name: string]: any;
}

export interface AsyncStorage {
  getItem(key: string): Promise<string | null | undefined>;
  setItem(key: string, value: string): Promise<void>;
  removeItem: (key: string) => void;
  [name: string]: any;
}

export interface SessionTokenBody {
  uid: string;
  exp: number;
  nonce: string;
}

export type Storage = SyncStorage | AsyncStorage;

export interface SessionTokenKeeper<T extends StorageBackends> {
  getSessionToken(): { token: SessionTokenBody; hash: Promise<string> } | null;
  setSessionToken(
    token: string
  ): T extends AsyncStorageBackends ? Promise<void> : void;
  sessionTokenStatus(): "expired" | "valid" | "missing" 
}

export const createTokenKeeper = <T extends StorageBackends>(
  options: KeyGateOptions<T>
) => {
  let storage: Storage | undefined;
  let inMemorySessionToken: string | null = null;
  let allowConstruct = true;

  const isDesktop = isBrowser
    ? (navigator as any).userAgentData.mobile === true
    : false;

  class SessionTokenKeeperImplementation implements SessionTokenKeeper<T> {
    constructor(options: KeyGateOptions<T>) {
      if (!allowConstruct)
        throw new Error("SessionTokenKeeper can't be constructed");
      storage = selectStorageBackend(options);
    }

    load(): T extends AsyncStorageBackends ? Promise<void> : void {
      // to improve security, we don't want to store the session token in localStorage
      // on desktop, so we only keep it in memory and persist it on unload
      // (beforeunload is unreliable on mobile, so we don't use this there)
      if (isDesktop)
        addEventListener("beforeunload", this.beforeUnloadListener, {
          capture: true,
        });

      // storage is undefined if we only use in-memory storage
      if (!storage) return undefined as any;

      // can be a promise if we use async storage
      const sessionToken = storage.getItem(sessionTokenKey);

      // sync storage backend
      if (typeof sessionToken === "string") {
        inMemorySessionToken = sessionToken;
        if (isDesktop) this.clearSessionToken();
        return undefined as any;
      }

      // async storage backend
      return sessionToken?.then((sessionToken) => {
        if (sessionToken) inMemorySessionToken = sessionToken;
      }) as any;
    }

    beforeUnloadListener() {
      if (inMemorySessionToken)
        void this.setSessionTokenInStorage(inMemorySessionToken);
    }

    /**
     * Parses a session token and returns the body
     * (or throws an error if the token is invalid)
     *
     * Does **not** check if the token is expired
     */
    parseSessionToken(sessionToken: string) {
      // KEYGATE tokens don't have a signature (it's a JWT without the signature)
      const [header, payload, _signature] = sessionToken.split(".");
      if (!header || !payload) throw new Error("Invalid session token");

      let headerObj, payloadObj: SessionTokenBody;
      try {
        headerObj = JSON.parse(atob(header));
        payloadObj = JSON.parse(atob(payload));
      } catch (_: unknown) {
        throw new Error("Invalid session token");
      }

      if (
        headerObj.typ !== "KEYGATE" ||
        typeof payloadObj.exp !== "number" ||
        typeof payloadObj.nonce !== "string" ||
        typeof payloadObj.uid !== "string"
      )
        throw new Error("Invalid session token");

      return payloadObj;
    }

    sessionTokenStatus(): "expired" | "valid" | "missing" {
      if (!inMemorySessionToken) return "missing";
      try {
        const { exp } = this.parseSessionToken(inMemorySessionToken);
        return exp * 1000 < Date.now() ? "expired" : "valid";
      } catch (_: unknown) {
        this.clearSessionToken();
        return "missing";
      }
    }

    getSessionToken() {
      if (!inMemorySessionToken) return null;

      const token = this.parseSessionToken(inMemorySessionToken);
      if (!token) return null;

      return {
        token,
        hash: sha256(inMemorySessionToken),
      };
    }

    setSessionToken(
      sessionToken: string
    ): T extends "secureStorage" ? Promise<void> : void {
      inMemorySessionToken = sessionToken;
      if (!isDesktop)
        return this.setSessionTokenInStorage(
          sessionToken
        ) as unknown as T extends "secureStorage" ? Promise<void> : void; // is there a better way to do this in typescript?
      return undefined as any;
    }

    setSessionTokenInStorage = (sessionToken: string) =>
      storage?.setItem?.(sessionTokenKey, sessionToken);

    clearSessionToken = () => storage?.removeItem?.(sessionTokenKey);
  }

  return new SessionTokenKeeperImplementation(options);
};

export const selectStorageBackend = <T extends StorageBackends>(
  options: KeyGateOptions<T>
): Storage | undefined => {
  switch (options.storageBackend) {
    case "secureStorage":
      if (!options.secureStorage)
        throw new Error("secureStorage is not provided");
      return options.secureStorage;
    case "sessionStorage":
      if (!isBrowser)
        throw new Error("sessionStorage is not supported in this environment");
      return window.sessionStorage;
    case "memory":
      return undefined;
    default:
      if (!isBrowser)
        throw new Error(
          "localStorage is not supported in this environment, use secureStorage instead"
        );
      return window.localStorage;
  }
};
