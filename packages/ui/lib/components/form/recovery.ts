import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { FormMixin, formStyles } from "./utils";

type Step = "recovery" | "recovery-success";

@customElement('keygate-ui-auth-form-recovery')
export class RecoveryForm extends FormMixin(LitElement) {
	@state() private _step: Step = "recovery";

	render() {
		switch (this._step) {
			case "recovery":
				return this.#renderRecovery();
			case "recovery-success":
				return this.#renderRecoverySuccess();
		}
	}

	#renderRecovery() {
		return html``;
	}

	#renderRecoverySuccess() {
		return html``;
	}

	static styles = css`
    ${formStyles}
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form-recovery": RecoveryForm;
	}
}

// <form @submit=${this.#onForgetSubmit}>

// 					<h2>${msg("Reset your password")}</h2>
// 					<p>
// 						${msg("Enter your email address and we'll send you a link to reset your password.")}
// 					</p>
// 					<keygate-ui-input
// 						placeholder=${msg("Email address")}
// 						type="email"
// 					></keygate-ui-input>
// 					<keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
// 					<p>
// 						<a href="#" @click=${this.#switchPage("login")}>
// 							${msg("Back to login")}
// 						</a>
// 					</p>
