import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { spread } from "@open-wc/lit-helpers";

@customElement('keygate-ui-input')
export class KeygateInput extends LitElement {
	@property({ type: String })
	placeholder = "";

	_required = false;
	@property({ type: Boolean })
	get required() {
		return this._required;
	}
	set required(isRequired) {
		this._required = isRequired;
		this._internals.ariaRequired = isRequired ? "true" : "false";
	}

	@property({ type: String })
	type: HTMLInputElement["type"] = "text";

	@state()
	private _filled = false;

	#value = "";
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

	connectedCallback() {
		super.connectedCallback();
		this._internals.setValidity({ valueMissing: true }, "Please fill out this field.");
	}

	render() {
		let inputProperties = {
			placeholder: this.placeholder,
			required: this.required,
			type: this.type,
		};

		return html`
      <div class=${classMap({ input: true, filled: this._filled })}>
        <label for="input">${this.placeholder}</label>
        <input type="email" @change=${this.#handleChange} id="input" type="text" ${spread(inputProperties)} />
      </div>
    `;
	}

	reportValidity() {
		this.input.reportValidity();
	}

	#handleChange(event: InputEvent) {
		const target = event!.target as HTMLInputElement;
		this._filled = target.value.length > 0;
		this.#value = target.value;

		if (target.validity.valid) {
			this._internals.setValidity({});
		} else {
			this._internals.setValidity(target.validity, target.validationMessage);
		}

		this._internals.setFormValue(this.#value);
	}

	static styles = css`
    :host {
    }

    .input {
      position: relative;
      display: flex;
    }

    .input:has(input) {
      margin-bottom: 1rem;
    }

    label:has(+ input)  {
      opacity: 0;
    }

    .input > label {
      position: absolute;
      top: 50%;
      padding: 1px 6px;
      transform: translate(20px, -50%);
      transition: all 0.1s ease-in-out;
      color: var(--kg-theme-label-text-color);
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
