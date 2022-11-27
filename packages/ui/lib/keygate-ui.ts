import { LitElement, ReactiveController, css, html, ReactiveControllerHost } from "lit";
import { customElement, property } from "lit/decorators.js";

import { createKeygateClient, Keygate, KeygateOptions, StorageBackends } from "@keygate/client";

import "./components/input";

class KeygateClientController<T extends StorageBackends> implements ReactiveController {
	host: ReactiveControllerHost;
	clientReady = false;
	client?: Keygate;

	constructor(host: ReactiveControllerHost, customClient: boolean, initialOptions: Partial<KeygateOptions<T>>) {
		(this.host = host).addController(this);

		if (customClient) return;

		if (!(initialOptions?.apiKey && initialOptions.domain && initialOptions?.apiURL)) {
			throw new Error("KeygateClientController: options not set");
		}

		let options: KeygateOptions<T> = {
			domain: initialOptions.domain,
			apiKey: initialOptions.apiKey,
			apiURL: initialOptions.apiURL,
			mode: initialOptions.mode,
			storageBackend: initialOptions.storageBackend,
		};

		let clientPromise = createKeygateClient(options);
		if (clientPromise instanceof Promise) {
			clientPromise.then((client) => {
				this.client = client;
				this.clientReady = true;
			});
		} else {
			this.client = clientPromise;
			this.clientReady = true;
		}
	}

	hostConnected() {}
}

@customElement('keygate-ui')
export class KeygateUI extends LitElement {
	#keygate = new KeygateClientController(this, !!this.attributes.getNamedItem("custom-client"), {
		domain: this.attributes.getNamedItem("domain")?.value,
		apiKey: this.attributes.getNamedItem("api-key")?.value,
		apiURL: this.attributes.getNamedItem("api-url")?.value,
	});

	@property({ type: Boolean, attribute: "custom-client" }) customClient: boolean = false;
	@property({ type: String, attribute: "domain" }) domain?: string;
	@property({ type: String, attribute: "api-key" }) apiKey?: string;
	@property({ type: String, attribute: 'api-url' }) apiURL?: string;

	firstUpdated() {
		console.log("client", this.#keygate.client);
		this.#keygate.client?.authedFetch("https://accounts.keygate.dev/api/v1/users/me").then((res) => {
			console.log("res", res);
		});
	}

	render() {
		return html`
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://lit.dev" target="_blank">
        </a>
      </div>
      <slot></slot>
      <div class="card">
        <button @click=${this._onClick} part="button">
          count is ${this.count}
        </button>
      </div>
    `;
	}

	@property({ type: Number })
	count = 0;

	private _onClick() {
		this.count++;
	}

	static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
    }
    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.lit:hover {
      filter: drop-shadow(0 0 2em #325cffaa);
    }

    .card {
      padding: 2em;
    }

    .read-the-docs {
      color: #888;
    }

    h1 {
      font-size: 3.2em;
      line-height: 1.1;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui": KeygateUI;
	}
}
