import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('keygate-ui-button')
export class KeygateButton extends LitElement {
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
		"keygate-ui-button": KeygateButton;
	}
}
