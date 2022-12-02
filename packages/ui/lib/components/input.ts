import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement('keygate-ui-input')
export class KeygateInput extends LitElement {
	@property({ type: String })
	placeholder = "";

	@state()
	private _filled = false;

	render() {
		return html`
      <div class=${classMap({ input: true, filled: this._filled })}>
        <label for="input">${this.placeholder}</label>
        <input @change=${this.#handleChange} placeholder="${this.placeholder}" id="input" type="text" />
      </div>
    `;
	}

	#handleChange(event: InputEvent) {
		if (!event?.target) return;
		const target = event.target as HTMLInputElement;
		this._filled = target.value.length > 0;
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

    .input input:invalid {
      border-color: var(--kg-theme-input-invalid-border-color);
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-input": KeygateInput;
	}
}
