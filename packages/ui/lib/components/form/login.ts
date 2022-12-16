import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { FormMixin, formStyles } from "./utils";

type Step = "login" | "login-password";

@customElement('keygate-ui-auth-form-login')
export class LoginForm extends FormMixin(LitElement) {
	@state() private _step: Step = "login";

	@property({ type: String })
	initialEmail?: string;

	render() {
		switch (this._step) {
			case "login":
				return this.#renderLogin();
			case "login-password":
				return this.#renderLoginPassword();
		}
	}

	#renderLogin() {
		return html`
      <form @submit=${this.#onLoginSubmit}>
        <h2>${msg("Welcome back")}</h2>
        <keygate-ui-input
          name="email"
          value=${this.initialEmail}
          submit
          required
          type="email"
          placeholder="${msg("Email address")}"
        ></keygate-ui-input>
        <keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
        ${this.#renderSignupLink()}
        <keygate-ui-hr label=${msg("or")}></keygate-ui-hr>
        <keygate-ui-button>${msg("Continue with Google")}</keygate-ui-button>
      </form>`;
	}

	#renderLoginPassword() {
		return html`
      <form>
        <h2>${msg("Enter your password")}</h2>
        <keygate-ui-input readonly value=${this.initialEmail} button=${msg("Edit")} @click=${this.#onEmailEdit} type="email"></keygate-ui-input>
        <keygate-ui-input submit required type="password" placeholder="${msg("Password")}"></keygate-ui-input>
        <a class="forget" href="#" @click=${this._switchWithEmail("recovery")}>${msg("Forget password?")}</a>
        <keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
        ${this.#renderSignupLink()}
      </form>`;
	}

	#renderSignupLink() {
		return html`
      <p> 
        ${msg("Don't have an account?")}
        <a href="#" @click=${this._switchWithEmail("register")}>
          ${msg("Sign up")}
        </a>
      </p>
    `;
	}

	#onLoginSubmit(e: Event) {
		e.preventDefault();

		const email = this._formData.get("email")?.toString();

		this.initialEmail = email;
		this._step = "login-password";
	}

	#onEmailEdit() {
		this._step = "login";
	}

	static styles = css`
    ${formStyles}
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form-login": LoginForm;
	}
}

// form = html`
