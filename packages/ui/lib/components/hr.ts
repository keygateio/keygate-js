import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('keygate-ui-hr')
export class KeygateHr extends LitElement {
	@property({ type: String })
	label: string = "";

	render() {
		return html`
      <div class="hr">
        <hr/>
        <h2>${this.label}</h2>
        <hr/>
      </div>
    `;
	}

	static styles = css`
    :host {
    }

    .hr {
      display: flex;
      align-items: center;
    }

    .hr hr {
      flex: 1;
      border: none;
      background: gray;
      height: 1px;
    }

    .hr h2 {
      margin: 0 1rem;
      font-size: 1rem;
      font-weight: 400;
      text-transform: uppercase;
    }
  `;
}

declare global {
	interface HTMLElementTagNameMap {
		"keygate-ui-hr": KeygateHr;
	}
}
