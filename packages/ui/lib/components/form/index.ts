import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { loader } from "../../assets/svg";
import { ClientMixin } from "../../context";

import "./login";
import "./signup";
import "./recovery";

import { RedirectEvent, SwitchPageEvent } from "./utils";

export type Page = "login" | "register" | "recovery";

@customElement('keygate-ui-auth-form')
export class KeygateAuthForm extends ClientMixin(LitElement) {
	@state() private page: Page = "login";
	@state() private loading = false;
	@state() private email = "";

	render() {
		let form = html`
			<p>
				${msg("An error occurred. Please try again.")}
			</p>
		`;

		if (this.loading || !this.clientReady) {
			return html`
				<div class="form loader">
					${loader}
				</div>
			`;
		}

		switch (this.page) {
			case "login": {
				form = html`
					<keygate-ui-auth-form-login
						initialemail=${this.email}
						@switchpage=${this.#switchPage}
						@redirect=${this.#redirect}
					></keygate-ui-auth-form-login>`;
				break;
			}
			case "register": {
				form = html`
					<keygate-ui-auth-form-signup
						initialemail=${this.email}
						@switchpage=${this.#switchPage}
						@redirect=${this.#redirect}
					></keygate-ui-auth-form-signup>`;
				break;
			}
			case "recovery": {
				form = html`
					<keygate-ui-auth-form-recovery
						@switchpage=${this.#switchPage}
						@redirect=${this.#redirect}
					></keygate-ui-auth-form-recovery>`;
				break;
			}
		}

		return html`
			<div class="form">
					${form}
			</div>
		`;
	}

	// TODO: implement redirect
	#redirect(e: RedirectEvent) {
		e.preventDefault();
		const { to, blank } = e.detail;
		alert(`redirect to ${to}, blank: ${blank}`);
	}

	#switchPage(e: SwitchPageEvent) {
		e.preventDefault();
		this.page = e.detail.page;
		if (e.detail.email) this.email = e.detail.email;
	}

	static styles = css`
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


  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form": KeygateAuthForm;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-auth-form": KeygateAuthForm;
	}
}
