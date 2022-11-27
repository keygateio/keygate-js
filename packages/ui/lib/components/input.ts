import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('keygate-input')
export class KeygateInput extends LitElement {


	render() { 
		return html`
      <div class=input>
        <input type="text" />
      </div>
    `;
	}


	static styles = css`
    :host {
    }

    .input {
      color: var(--kg-theme-text-color);
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-input": KeygateInput;
	}
}
