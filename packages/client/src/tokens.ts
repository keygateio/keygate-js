import { AsyncStorageBackends, KeyGateOptions, StorageBackends } from ".";
import * as idbkv from "idb-keyval";

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

export type Storage = SyncStorage | AsyncStorage;

export const createTokenKeeper = <T extends StorageBackends>(
  options: KeyGateOptions<T>
) => {
  let storage: Storage | undefined;
  let inMemoryToken: string | null = null;
  let allowConstruct = true;
  const tokenKey = "dG9rZW4";

  const isBrowser = typeof window !== "undefined";
  const isDesktop = isBrowser
    ? (navigator as any).userAgentData.mobile === true
    : false;

  class TokenKeeper {
    constructor(options: KeyGateOptions<T>) {
      if (!allowConstruct) {
        throw new Error("TokenKeeper can't be constructed");
      }

      switch (options.storageBackend) {
        case "indexedDB":
          if (!isBrowser)
            throw new Error("indexedDB is not supported in this environment");
          storage = {
            setItem: idbkv.set,
            getItem: idbkv.get,
            removeItem: idbkv.del,
          };
          break;
        case "secureStorage":
          storage = options.secureStorage;
          break;
        case "sessionStorage":
          if (!isBrowser)
            throw new Error(
              "sessionStorage is not supported in this environment"
            );
          storage = window.sessionStorage;
          break;
        case "memory":
          storage = undefined;
          break;
        default:
          storage = window.localStorage;
      }
    }

    load(): T extends AsyncStorageBackends ? Promise<void> : void {

      // beforeunload is unreliable on mobile, so we don't use it there
      if (isDesktop)
        addEventListener("beforeunload", this.beforeUnloadListener, {
          capture: true,
        });

      if (!storage) return undefined as any;
      const token = storage.getItem(tokenKey);
      if (typeof token === "string") {
        inMemoryToken = token;
        if (isDesktop) this.clearToken();
        return undefined as any;
      }

      return token?.then((token) => {
        if (token) inMemoryToken = token;
      }) as any;
    }

    beforeUnloadListener() {
      if (inMemoryToken) void this.setTokenInStorage(inMemoryToken);
    }

    getToken() {
      if (inMemoryToken) return inMemoryToken;
    }

    async setToken(token: string) {
      inMemoryToken = token;
      if (!isDesktop) await this.setTokenInStorage(token);
    }

    async setTokenInStorage(token: string) {
      await storage?.setItem?.(tokenKey, token);
    }

    async clearToken() {
      await storage?.removeItem?.(tokenKey);
    }
  }

  return new TokenKeeper(options);
};
