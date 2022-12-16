import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "element-internals-polyfill"; // This is a polyfill for the ElementInternals API

import "./components/input.js";
import "./components/button.js";
import "./components/standalone.js";
import "./components/card.js";
import "./components/form";
import "./components/hr.js";

import { consumeKeygateContext, KeygateContext } from "./context.js";

@customElement('keygate-ui')
export class KeygateUI extends LitElement {
	@consumeKeygateContext()
  @property({attribute: false})
	public context?: KeygateContext;

	@property({ type: Boolean }) standalone = false;

	firstUpdated() {
		if (!this.context) {
			throw new Error(
				"KeygateUI: context not set. Did you forget to wrap the component in a <keygate-context-provider> element?",
			);
		}

		console.log("client", this.context?.client);
	}

	render() {
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
