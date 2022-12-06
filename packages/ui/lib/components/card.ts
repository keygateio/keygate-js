import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('keygate-ui-card')
export class KeygateCard extends LitElement {
	render() {
		return html`
      <div class="card">
        <slot></slot>
      </div>
    `;
	}

	static styles = css`
    :host {
      display: flex;
      height: auto;
      min-height: 500px;
      max-width: calc(100vw - 2rem);
      color: var(--kg-theme-text-color);
    }

    .card {
      width: 300px;
      background: var(--kg-theme-card-background);
      padding: 48px 40px 36px 40px;
      border-radius: var(--kg-theme-card-border-radius);
      max-width: 100%;
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-card": KeygateCard;
	}
}
