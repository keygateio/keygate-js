import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('keygate-ui-auth-form')
export class KeygateAuthForm extends LitElement {
	render() {
		return html`
			<div class="form">
				<h2>${msg("Welcome back")}</h2>
				<keygate-ui-input placeholder="${msg("Email address")}"></keygate-ui-input>
				<keygate-ui-button>${msg("Continue")}</keygate-ui-button>
				<p>
					${msg("Don't have an account?")}
					<a href="/signup">${msg("Sign up")}</a>
				</p>
				<keygate-ui-hr label=${msg("or")}></keygate-ui-hr>
				<keygate-ui-button variant="outline">${msg("Continue with Google")}</keygate-ui-button>
			</div>
		`;
	}

	static styles = css`
    :host {
    }

		h1, h2, h3, h4, h5, h6 {
			margin: 0;
		}

		.form > keygate-ui-input {
			margin-bottom: 1rem;
		}

		.form > p {
			margin-top: 2rem;
			margin-bottom: 2rem;
			text-align: center;
		}

    .form {
      color: var(--kg-theme-text-color);
			display: flex;
			flex-direction: column;
    }

		.form > h2 {
			text-align: center;
			margin-top: 2rem;
			margin-bottom: 3rem;
			font-size: 1.8rem;
			font-weight: 500;
		}

		.form > keygate-ui-hr {
			margin-bottom: 2rem;
		}
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form": KeygateAuthForm;
	}
}
