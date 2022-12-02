import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

type Step = "login" | "login-password" | "register" | "register-password";

@customElement('keygate-ui-auth-form')
export class KeygateAuthForm extends LitElement {
	@state() private _step: Step = "login-password";
	#initialEmailValue = "";

	render() {
		let loginForm = html`
			<p>
				${msg("An error occurred. Please try again.")}
			</p>
		`;

		switch (this._step) {
			case "login": {
				loginForm = html`
				<form @submit=${this.#onLoginSubmit}>
					<h2>${msg("Welcome back")}</h2>
					<keygate-ui-input
						value=${this.#initialEmailValue}
						submit
						required
						type="email"
						placeholder="${msg("Email address")}"
					></keygate-ui-input>
					<keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
					<p>
						${msg("Don't have an account?")}
						<a href="#" @click=${this.#switchPage("register")}>${msg("Sign up")}</a>
					</p>
					<keygate-ui-hr label=${msg("or")}></keygate-ui-hr>
					<keygate-ui-button variant="outline">${msg("Continue with Google")}</keygate-ui-button>
				</form>`;
				break;
			}
			case "register": {
				loginForm = html`
				<form @submit=${this.#onRegisterSubmit}>
					<h2>${msg("Create your account")}</h2>
					<keygate-ui-input submit required type="email" placeholder="${msg("Email address")}"></keygate-ui-input>
					<keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
					<p>
						${msg("Already have an account?")}
						<a href="#" @click=${this.#switchPage("login")}>${msg("Log in")}</a>
					</p>
					<keygate-ui-hr label=${msg("or")}></keygate-ui-hr>
					<keygate-ui-button variant="outline">${msg("Continue with Google")}</keygate-ui-button>
				</form>`;
				break;
			}
			case "login-password": {
				loginForm = html`
				<form>
					<h2>${msg("Enter your password")}</h2>
					<keygate-ui-input readonly value="test@example.com" button=${msg("Edit")} @click=${this.#onEmailEdit} type="email"></keygate-ui-input>
					<keygate-ui-input submit required type="password" placeholder="${msg("Password")}"></keygate-ui-input>
					<a class="forget" href="#">${msg("Forget password?")}</a>
					<keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
					<p>
						${msg("Don't have an account?")}
						<a href="#" @click=${this.#switchPage("register")}>${msg("Sign up")}</a>
					</p>
				</form>`;
				break;
			}
		}

		return html`
			<div class="form">
					${loginForm}
			</div>
		`;
	}

	#onEmailEdit(e: Event) {
		this.#initialEmailValue = (e.target as HTMLInputElement).value;
		console.log(this.#initialEmailValue);

		this._step = "login";
	}

	#switchPage(step: Step) {
		return (e: Event) => {
			e.preventDefault();
			this._step = step;
		};
	}

	#onLoginSubmit(e: Event) {
		e.preventDefault();
		this._step = "login-password";
	}

	#onRegisterSubmit(e: Event) {
		e.preventDefault();
		this._step = "register-password";
	}

	static styles = css`
    :host {
    }

		h1, h2, h3, h4, h5, h6 {
			margin: 0;
		}

		.form form > keygate-ui-input {
			margin-bottom: 1rem;
		}

		.form form > p {
			margin-top: 2rem;
			margin-bottom: 2rem;
			text-align: center;
		}

    .form form {
      color: var(--kg-theme-text-color);
			display: flex;
			flex-direction: column;
    }

		.form form > h2 {
			text-align: center;
			margin-top: 2rem;
			margin-bottom: 3rem;
			font-size: 1.8rem;
			font-weight: 500;
		}

		.form form > keygate-ui-hr {
			margin-bottom: 2rem;
		}

		.form form > a.forget {
			margin-bottom: 1rem;
		}
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form": KeygateAuthForm;
	}
}
