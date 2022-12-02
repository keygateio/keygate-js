import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { spread } from "@open-wc/lit-helpers";

@customElement('keygate-ui-input')
export class KeygateInput extends LitElement {
	/**
	 * Placeholder/label text for the input
	 */
	@property({ type: String })
	placeholder = "";

	@property({ type: Boolean })
	readonly = false;

	@property({ type: String })
	button = "";

	/**
	 * Submit the form when the user presses enter
	 */
	@property({ type: Boolean })
	submit = false;

	@property({ type: String })
	type: HTMLInputElement["type"] = "text";

	_required = false;
	@property({ type: Boolean })
	get required() {
		return this._required;
	}
	set required(isRequired) {
		this._required = isRequired;
		this._internals.ariaRequired = isRequired ? "true" : "false";
	}

	@state()
	private _filled = false;

	#value = "";
	@property({ type: String })
	get value() {
		return this.#value;
	}
	set value(v) {
		this.#value = v;
	}

	get input(): HTMLInputElement {
		return this.shadowRoot?.querySelector("input") as HTMLInputElement;
	}

	// Identify the element as a form-associated custom element
	static formAssociated = true;
	_internals: ElementInternals;

	constructor() {
		super();
		this._internals = this.attachInternals();
		this.addEventListener("invalid", this.reportValidity);
	}

	firstUpdated() {
		if (this.value !== "") {
			this.#validate();
			this._filled = true;
		} else {
			this._internals.setValidity({ valueMissing: true }, "Please fill out this field.");
		}
	}

	render() {
		let inputProperties = {
			placeholder: this.placeholder,
			required: this.required,
			type: this.type,
			id: "input",
			disabled: this.readonly ? true : undefined,
			"aria-disabled": this.readonly ? "true" : "false",
			value: this.value,
		};

		return html`
      <div class=${classMap({ input: true, filled: this.readonly ? true : this._filled })}>
        ${this.placeholder ? html`<label for="input">${this.placeholder}</label>` : nothing}
        <input
          @keydown=${this.#onKeyDown}
          @change=${this.#handleChange}
          ${spread(inputProperties)}
        />
        ${this.button ? html`<button @click=${this.#onClick} class="button">${this.button}</button>` : nothing}
      </div>
    `;
	}

	#onClick(e: Event) {
		const detail = { target: this };
		const event = new CustomEvent("click", { detail, bubbles: true, composed: true, cancelable: true });
		this.dispatchEvent(event);
		if (event.defaultPrevented) e.preventDefault();
	}

	reportValidity() {
		this.input.reportValidity();
	}

	#onKeyDown(e: KeyboardEvent) {
		if (this.submit && this._internals.form && e.key === "Enter") {
			this.#validate();
			this._internals.form?.requestSubmit();
			this._internals.form?.reportValidity();
		}
	}

	#handleChange() {
		this.#value = this.input.value;
		this._filled = this.input.value.length > 0;
		this.#validate();
		this._internals.setFormValue(this.#value);
	}

	#validate() {
		if (this.input.validity.valid) {
			this._internals.setValidity({});
		} else {
			this._internals.setValidity(this.input.validity, this.input.validationMessage);
		}
	}

	static styles = css`
    :host {
    }

    .input > button {
      position: absolute;
      top: 50%;
      right: 0;
      padding: 1px 6px;
      transform: translate(-15px, -50%);
      color: var(--kg-theme-active-text-color);
      background: none;
      border: none;
      cursor: pointer;
    }

    .input {
      position: relative;
      display: flex;
    }

    .input > label {
      position: absolute;
      top: 50%;
      padding: 1px 6px;
      transform: translate(15px, -50%);
      transition: all 0.1s ease-in-out;
      color: var(--kg-theme-label-text-color);
      pointer-events: none;
    }

    .input:focus-within > label, .input.filled > label {
      transform: translate(10px, calc(-150% - 4px));
      background: white;
    }

    .input:focus-within > label {
      color: var(--kg-theme-input-focus-label-text-color);
    }

    .input input {
      width: 100%;
      color: var(--kg-theme-input-text-color);
      border: var(--kg-theme-input-border);
      border-radius: var(--kg-theme-input-border-radius);
      padding: 1rem;
      background: white;
      outline: none;
      font-size: 1rem;
    }

    .input input::placeholder {
      opacity: 0;
    }

    .input input:focus {
      border-color: var(--kg-theme-input-focus-border-color);
    }

    .input.filled input:invalid {
      border-color: var(--kg-theme-input-invalid-border-color);
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-input": KeygateInput;
	}
}
