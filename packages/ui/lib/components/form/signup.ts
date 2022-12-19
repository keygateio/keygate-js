import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Mutation } from "../../query";
import { FormMixin, formStyles } from "./utils";

type Step = "signup" | "signup-password";

@customElement('keygate-ui-auth-form-signup')
export class SignupForm extends FormMixin(LitElement) {
	@state() private _step: Step = "signup";

	@property({ type: String })
	initialEmail?: string;

	createSignupProcess = new Mutation(this, "signup", this.client.api.createSignupProcess);
	signupProcessPassword = new Mutation(this, "signup-password", this.client.api.signupProcessPassword);

	render() {
		switch (this._step) {
			case "signup":
				return this.#renderSignup();
			case "signup-password":
				return this.#renderSignupPassword();
		}
	}

	#renderSignup() {
		return html`
      <form @submit=${this.#onRegisterSubmit}>
        <h2>${msg("Create your account")}</h2>
        <keygate-ui-input name="email" value=${this.initialEmail} submit required type="email" placeholder="${msg(
			"Email address",
		)}"></keygate-ui-input>
        <keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
        <p>
          ${msg("Already have an account?")}
          <a href="#" @click=${this._switchWithEmail("login")}>${msg("Log in")}</a>
        </p>
        <keygate-ui-hr label=${msg("or")}></keygate-ui-hr>
        <keygate-ui-button variant="outline">${msg("Continue with Google")}</keygate-ui-button>
      </form>`;
	}

	#renderSignupPassword() {
		return html``;
	}

	#onRegisterSubmit(e: Event) {
		e.preventDefault();
	}

	static styles = css`
    ${formStyles}
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form-signup": SignupForm;
	}
}
