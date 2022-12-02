import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('keygate-ui-button')
export class KeygateButton extends LitElement {
	render() {
		return html`
      <button class="button">
        <slot></slot>
      </button>
    `;
	}

	static styles = css`
    :host {
    }

    .button {
      position: relative;
      display: flex;
      padding: 1rem;
      width: 100%;
      justify-content: center;
      font-size: 1rem;
      
      cursor: pointer;
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-button": KeygateButton;
	}
}
