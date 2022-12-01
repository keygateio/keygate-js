import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('keygate-ui-standalone')
export class KeygateStandalone extends LitElement {
	render() {
		return html`
      <div class="wrapper">
        <slot></slot>
      </div>
    `;
	}

	static styles = css`
    :host {
      flex: 1;
      background: var(--kg-theme-background);
      display: grid;
      place-items: center;
      width: 100vw;
    }

    .wrapper {
      margin: 1rem;
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-standalone": KeygateStandalone;
	}
}
