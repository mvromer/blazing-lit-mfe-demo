import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('mfe-profile-app')
export class ProfileApp extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: calc(7 * var(--mfe-spacing-1));
    }

    img {
      width: 200px;
      height: 200px;

      border: 1px solid var(--mfe-color-night);
      background-color: var(--mfe-color-jet);
      border-radius: 8px;
      box-shadow: inset 0px 0px 49px -13px rgba(0, 0, 0, 0.75);
      -webkit-box-shadow: inset 0px 0px 49px -13px rgba(0, 0, 0, 0.75);
    }

    dl {
      display: grid;
      grid-template-columns: max-content auto;
      gap: calc(3.5 * var(--mfe-spacing-1)) 0;
      margin: 0;

      font: var(--mfe-font-h5);
    }

    dt {
      grid-column-start: 1;
    }

    dt::after {
      content: ':';
    }

    dd {
      grid-column-start: 2;
    }
  `;

  render() {
    return html`
      <img
        src="https://robohash.org/blazing-lit-mfe-demo?set=set5&size=200x200"
      />
      <dl>
        <dt>Name</dt>
        <dd>Bobo Robo</dd>
        <dt>Location</dt>
        <dd>Other side of the galaxy</dd>
        <dt>Customer since</dt>
        <dd>3853 CE</dd>
      </dl>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mfe-profile-app': ProfileApp;
  }
}
