import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loader } from "../assets/svg";
import { consumeKeygateContext, KeygateContext } from "../context";

type Step = "login" | "login-password" | "register" | "register-password" | "forgot-password";

@customElement('keygate-ui-auth-form')
export class KeygateAuthForm extends LitElement {
	@consumeKeygateContext()
  @property({attribute: false})
	_context?: KeygateContext;

	get #client() {
		if (!this?._context?.clientReady) throw new Error("KeygateClientController: client not ready");
		return this._context.client;
	}

	@state() private _step: Step = "login";
	#initialEmailValue = "";

	@state() private _loading = false;

	render() {
		let form = html`
			<p>
				${msg("An error occurred. Please try again.")}
			</p>
		`;

		if (this._loading || !this._context?.clientReady) {
			return html`
				<div class="form loader">
					${loader}
				</div>
			`;
		}

		switch (this._step) {
			case "forgot-password": {
				form = html`
					<form @submit=${this.#onForgetSubmit}>

					<h2>${msg("Reset your password")}</h2>
					<p>
						${msg("Enter your email address and we'll send you a link to reset your password.")}
					</p>
					<keygate-ui-input
						placeholder=${msg("Email address")}
						type="email"
					></keygate-ui-input>
					<keygate-ui-button type="submit">${msg("Continue")}</keygate-ui-button>
					<p>
						<a href="#" @click=${this.#switchPage("login")}>
							${msg("Back to login")}
						</a>
					</p>
				`;
				break;
			}
			case "login": {
				form = html`
				<form @submit=${this.#onLoginSubmit}>
					<h2>${msg("Welcome back")}</h2>
					<keygate-ui-input
						name="email"
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
					<keygate-ui-button>${msg("Continue with Google")}</keygate-ui-button>
				</form>`;
				break;
			}
			case "register": {
				form = html`
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
				form = html`
				<form>
					<h2>${msg("Enter your password")}</h2>
					<keygate-ui-input readonly value="test@example.com" button=${msg("Edit")} @click=${this.#onEmailEdit} type="email"></keygate-ui-input>
					<keygate-ui-input submit required type="password" placeholder="${msg("Password")}"></keygate-ui-input>
					<a class="forget" href="#" @click=${this.#onForget}>${msg("Forget password?")}</a>
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
					${form}
			</div>
		`;
	}

	#onForget(e: Event) {
		e.preventDefault();
		this._step = "forgot-password";
	}

	#onForgetSubmit(e: Event) {
		e.preventDefault();
	}

	#onEmailEdit(e: Event) {
		this.#initialEmailValue = (e.target as HTMLInputElement).value;
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

		var formData = new FormData(e.target as HTMLFormElement);
		let username_or_email = formData.get("email") as string;
		console.log(formData);

		this.#client.api
			.createLoginProcess({
				device_id: this.#client.deviceID,
				username_or_email,
			})
			.then((res) => {
				console.log(res);
			});

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

		@keyframes loader {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}

		.loader svg {
			width: 3rem;
			height: 3rem;
			animation: loader 1s linear infinite;
		}

		.form.loader {
			display: flex;
			justify-content: center;
			align-items: center;
		}


		.form form > keygate-ui-input {
			margin-bottom: 1rem;
		}

		.form form > p {
			margin-top: 2rem;
			margin-bottom: 2rem;
			text-align: center;
		}

		.form {
			min-height: 29rem;
			display: flex;
		}

    .form form {
			flex: 1;
			transition: all 0.3s ease-in-out;
      color: var(--kg-theme-text-color);
			display: flex;
			flex-direction: column;
			justify-content: space-between;
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
