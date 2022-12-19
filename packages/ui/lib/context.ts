import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createContext, provide, consume as contextConsume } from "@lit-labs/context";

import { createKeygateClient, Keygate, KeygateOptions, StorageBackends } from "@keygate/client";
import { publicModels } from "@keygate/api";

export const consumeKeygateContext = () => contextConsume({ context: keygateContext, subscribe: true });

export type KeygateContext =
	| {
			client?: undefined;
			clientReady: false;
			meta?: undefined;
			metaReady: false;
	  }
	| {
			client: Keygate;
			clientReady: true;
			meta?: undefined;
			metaReady: false;
	  }
	| {
			client: Keygate;
			clientReady: true;
			meta: publicModels.MetaResonse;
			metaReady: true;
	  };

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
		metaReady: false,
	};

	async #loadMeta() {
		if (!this.context.client) throw new Error("KeygateClientController: client not set");
		let meta = await this.context.client.api.meta();
		this.context.meta = meta;
		this.context.metaReady = true;
	}

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
			clientPromise
				.then((client) => {
					this.context.client = client;
					this.context.clientReady = true;
					return this.#loadMeta().catch((err) => {
						console.error(`KeygateClientController: failed to load metadata: ${err}`);
					});
				})
				.catch((err) => {
					console.error(`KeygateClientController: failed to create client: ${err}`);
				});
		} else {
			this.context.client = clientPromise;
			this.context.clientReady = true;

			this.#loadMeta().catch((err) => {
				console.error(`KeygateClientController: failed to load metadata: ${err}`);
			});
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

export declare class ClientMixinInterface {
	client: Keygate;
	clientReady: boolean;
	meta: publicModels.MetaResonse;
	metaReady: boolean;
}

// rome-ignore lint/suspicious/noExplicitAny: this is fine
type Constructor<T = {}> = new (...args: any[]) => T;
export const ClientMixin = <T extends Constructor<LitElement>>(superClass: T) => {
	class ClientMixin extends superClass {
		@consumeKeygateContext()
		@property({attribute: false})
		_context?: KeygateContext;

		@state()
		get clientReady() {
			return this._context?.clientReady;
		}

		@state()
		get metaReady() {
			return this._context?.metaReady;
		}

		get meta() {
			if (!this?._context?.metaReady) throw new Error("KeygateClientController: client not ready");
			return this._context.meta;
		}
	}

	return ClientMixin as Constructor<ClientMixinInterface> & T;
};
