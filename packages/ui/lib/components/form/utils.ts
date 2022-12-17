import { css, LitElement } from "lit";
import { query } from "lit/decorators.js";
import { Page } from ".";
import { ClientMixin, ClientMixinInterface } from "../../context";

export declare class FormMixinInterface extends ClientMixinInterface {
	_switchPage(detail: SwitchPageEvent["detail"]): void;
	_redirect(detail: RedirectEvent["detail"]): void;
	_switchWithEmail(page: Page): () => void;

	_formData: FormData;
	_formElement: HTMLFormElement;
}

// rome-ignore lint/suspicious/noExplicitAny: this is needed for mixins
type Constructor<T = {}> = new (...args: any[]) => T;
export const FormMixin = <T extends Constructor<LitElement>>(superClass: T) => {
	class FormMixin extends ClientMixin(superClass) {
		@query("form") _formElement!: HTMLFormElement;

		render() {
			if (!this.clientReady) throw new Error("<keygate-ui-auth-form-`*`> requires a <keygate-ui-client> context");
			return super.render();
		}

		get _formData() {
			return new FormData(this._formElement);
		}

		_switchPage(detail: SwitchPageEvent["detail"]) {
			let event: SwitchPageEvent = new CustomEvent("switchpage", {
				detail,
			});

			this.dispatchEvent(event);
		}

		_switchWithEmail(page: Page) {
			return () => this._switchPage({ page, email: this._formData.get("email")?.toString() });
		}

		_redirect(detail: RedirectEvent["detail"]) {
			let event: RedirectEvent = new CustomEvent("switchpage", {
				detail,
			});

			this.dispatchEvent(event);
		}
	}

	return FormMixin as Constructor<FormMixinInterface> & T;
};

export type SwitchPageEvent = CustomEvent<{
	page: Page;
	email?: string | null;
}>;

export type RedirectEvent = CustomEvent<{
	to: "home" | "app" | "email";
	blank?: boolean; // open in new tab
}>;

export const formStyles = css`
		form {
			min-height: 26rem;
		}

		form > keygate-ui-input {
			margin-bottom: 1rem;
		}

		form > p {
			margin-top: 2rem;
			margin-bottom: 2rem;
			text-align: center;
		}

    form {
			flex: 1;
			transition: all 0.3s ease-in-out;
      color: var(--kg-theme-text-color);
			display: flex;
			flex-direction: column;
			justify-content: space-between;
    }

		form > h2 {
			text-align: center;
			margin-top: 2rem;
			margin-bottom: 3rem;
			font-size: 1.8rem;
			font-weight: 500;
		}

		form > keygate-ui-hr {
			margin-bottom: 2rem;
		}

		form > a.forget {
			margin-bottom: 1rem;
		}
`;
