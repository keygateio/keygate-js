type KeyGateOptions = {};

type WorkerResponses = {
  login: { success: boolean };
  logout: { success: boolean };
};

type ClientParams = {
  login: { username: string; password: string };
  logout: {};
};

type Methods = keyof WorkerResponses | keyof ClientParams;

type ClientMessage = (
  | {
      method: "login";
      params: { username: string; password: string };
    }
  | {
      method: "logout";
    }
) & { id: number };

type WorkerMessage<T extends Methods> = {
  method: T;
  response: WorkerResponses[T] | { error: string };
  id: number;
};

export class KeyGate {
  #options: KeyGateOptions;
  #worker: Worker;
  #lastId: number = 0;

  constructor(options: KeyGateOptions) {
    if (typeof Worker === "undefined") {
      throw new Error("KeyGate requires a browser with Web Workers");
    }

    this.#options = options;
    this.#worker = new Worker(new URL("./worker.js", import.meta.url));
    this.#load();
  }

  #genID() {
    return ++this.#lastId;
  }

  #load() {
    this.#worker.addEventListener("message", this.#onMessage);
    this.#worker.addEventListener("messageerror", this.#onMessageError);
  }

  #onMessage<T extends Methods>(event: MessageEvent<WorkerMessage<T>>) {}
  #onMessageError(event: MessageEvent) {}

  #sendMessage<T extends ClientMessage>(message: T) {
    this.#worker.postMessage(message);
  }

  unload() {
    this.#worker.removeEventListener("message", this.#onMessage);
    this.#worker.removeEventListener("messageerror", this.#onMessageError);
    this.#worker.terminate();
  }

  #waitForResponse<Method extends Methods>(
    id: number
  ): Promise<WorkerMessage<Method>["response"]> {
    return new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent<WorkerMessage<Method>>) => {
        if (event.data.id !== id) return;
        this.#worker.removeEventListener("message", onMessage);
        this.#worker.removeEventListener("messageerror", onMessage);

        if (event.data.response.hasOwnProperty("error")) {
          reject(new Error((event.data.response as any).error as string));
        }

        resolve(event.data.response);
      };

      const onMessageError = (event: MessageEvent) => {
        if (event.data.id !== id) return;
        reject(new Error("Message error"));
      };

      this.#worker.addEventListener("message", onMessage);
      this.#worker.addEventListener("messageerror", onMessageError);
    });
  }

  async login(params: { username: string; password: string }) {
    const id = this.#genID();
    this.#sendMessage({ method: "login", params, id });
    return this.#waitForResponse<"login">(id);
  }
}
