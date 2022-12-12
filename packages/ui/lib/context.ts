import { createKeygateClient, Keygate, KeygateOptions, StorageBackends } from "@keygate/client";
import { createContext, provide } from "@lit-labs/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { consume as contextConsume } from "@lit-labs/context";

export const consumeKeygateContext = () => contextConsume({ context: keygateContext, subscribe: true });

export interface KeygateContext {
	client?: Keygate;
	clientReady: boolean;
}

export const keygateContext = createContext<KeygateContext>("keygate");

@customElement('keygate-context-provider')
export class KeygateContextProvider<T extends StorageBackends> extends LitElement {
	@property({ type: Boolean, attribute: "custom-client" }) customClient: boolean = false;
	@property({ type: String, attribute: "domain" }) domain?: string;
	@property({ type: String, attribute: "api-key" }) apiKey?: string;
	@property({ type: String, attribute: 'api-url' }) apiURL?: string;
	@property({ type: String, attribute: 'storage-backend' }) storageBackend?: T;
	@property({ type: Boolean }) standalone = false;

	@provide({context: keygateContext})
  @property({attribute: false})
	public context: KeygateContext = {
		clientReady: false,
	};

	firstUpdated() {
		if (this.customClient) return;

		if (!(this.apiKey && this.domain && this.apiURL)) {
			throw new Error("KeygateClientController: options not set");
		}

		let options: KeygateOptions<T> = {
			domain: this.domain,
			apiKey: this.apiKey,
			apiURL: this.apiURL,
			mode: "integrated",
			storageBackend: this.storageBackend,
		};

		let clientPromise = createKeygateClient(options);
		if (clientPromise instanceof Promise) {
			clientPromise.then((client) => {
				this.context.client = client;
				this.context.clientReady = true;
			});
		} else {
			this.context.client = clientPromise;
			this.context.clientReady = true;
		}
	}

	render() {
		return html`
      <slot></slot>
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-context-provider": KeygateContextProvider<StorageBackends>;
	}
}
