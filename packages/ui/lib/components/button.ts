import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { spread } from "@open-wc/lit-helpers";

import { IElementInternals } from "element-internals-polyfill";

@customElement('keygate-ui-button')
export class KeygateButton extends LitElement {
	@property ({ type: String })
	type: HTMLButtonElement["type"] = "button";

	// Identify the element as a form-associated custom element
	static formAssociated = true;
	_internals: IElementInternals;

	constructor() {
		super();
		this._internals = this.attachInternals();
	}

	#onClick() {
		if (this.type === "submit") {
			if (!this._internals.form?.reportValidity()) return;
			this._internals.form?.requestSubmit();
		}
	}

	#onKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			this.#onClick();
		}
	}

	render() {
		let buttonProperties = {
			type: this.type,
		};

		return html`
      <button @keydown=${this.#onKeyDown} @click=${this.#onClick} ${spread(buttonProperties)} class="button">
        <slot></slot>
      </button>
    `;
	}

	static styles = css`
    :host {
    }

    .button {
      position: relative;
      display: flex;
      padding: 1rem;
      width: 100%;
      justify-content: center;
      font-size: 1rem;
      
      cursor: pointer;
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-button": KeygateButton;
	}
}
