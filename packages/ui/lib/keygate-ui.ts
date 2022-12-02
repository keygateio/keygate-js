import { LitElement, ReactiveController, css, html, ReactiveControllerHost } from "lit";
import { customElement, property } from "lit/decorators.js";

import { createKeygateClient, Keygate, KeygateOptions, StorageBackends } from "@keygate/client";

import "./components/input.js";
import "./components/button.js";
import "./components/standalone.js";
import "./components/card.js";
import "./components/auth-form.js";
import "./components/hr.js";

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

	@property({ type: Boolean })
	standalone = false;

	firstUpdated() {
		console.log("client", this.#keygate.client);
		this.#keygate.client?.authedFetch("https://accounts.keygate.dev/api/v1/users/me").then((res) => {
			console.log("res", res);
		});
	}

	render() {
		console.log(this.standalone);

		if (this.standalone) {
			return html`
        <keygate-ui-standalone>
          <keygate-ui-card>
						<keygate-ui-auth-form />
					</keygate-ui-card>
        </keygate-ui-standalone>
    `;
		}

		return html`
			<keygate-ui-card>
				<keygate-ui-auth-form />
			</keygate-ui-card>
    `;
	}

	static styles = css`
		:host {
			height: 100%;
			width: 100%;
			display: flex;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui": KeygateUI;
	}
}
