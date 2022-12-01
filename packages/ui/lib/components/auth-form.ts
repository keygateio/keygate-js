import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('keygate-ui-auth-form')
export class KeygateAuthForm extends LitElement {
	render() {
		return html`
			<div>
				<h2>${msg("Welcome back")}</h2>
			</div>
		`;
	}

	static styles = css`
    :host {
    }

    .input {
      color: var(--kg-theme-text-color);
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form": KeygateAuthForm;
	}
}
