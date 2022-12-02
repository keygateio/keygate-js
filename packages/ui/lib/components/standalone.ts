import { msg } from "@lit/localize";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('keygate-ui-standalone')
export class KeygateStandalone extends LitElement {
	@property({ type: String })
	privacyLink = "";

	@property({ type: String })
	termsLink = "";

	@property({ type: String })
	helpLink = "";

	render() {
		return html`
      <div class="wrapper">
        <slot></slot>
        <div class="links">
          ${
						this.helpLink
							? html`<a target="_blank" rel="noopener noreferrer" href=${this.helpLink}>${msg("Help")}</a>`
							: nothing
					}
          ${
						this.privacyLink
							? html`<a target="_blank" rel="noopener noreferrer" href=${this.privacyLink}>${msg("Privacy")}</a>`
							: nothing
					}
          ${
						this.termsLink
							? html`<a target="_blank" rel="noopener noreferrer" href=${this.termsLink}>${msg("Terms")}</a>`
							: nothing
					}
          <a target="_blank" rel="noopener noreferrer" href="https://keygate.io/ui/credits">Credits</a>
        </div>
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
      height: fit-content;
      min-height: 100%;
    }

    .links {
      display: flex;
    }

    .links a {
      margin-top: 1rem;
      opacity: 0.5;
      text-decoration: none;
      color: var(--kg-theme-text);
    }

    .links a:hover {
      opacity: 1;
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
