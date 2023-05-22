import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('mfe-profile-app')
export class ProfileApp extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html` <div>Profile App</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-profile-app': ProfileApp;
  }
}
