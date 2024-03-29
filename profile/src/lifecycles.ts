import { html, render } from 'lit';

import type { LifeCycleFn } from 'single-spa';

import './profile-app.js';

type CustomAppProps = {
  navigationBaseUrl: string;
};

type MicroFrontendLifecycleFn = LifeCycleFn<CustomAppProps>;

function getMountPoint(appName: string) {
  return document.getElementById(`single-spa-application:${appName}`);
}

// The actual single-spa lifecycle callbacks.

export const bootstrap: MicroFrontendLifecycleFn = () => {
  return Promise.resolve();
};

export const mount: MicroFrontendLifecycleFn = async ({ name: appName }) => {
  const mountPoint = getMountPoint(appName);
  if (mountPoint) {
    render(html`<mfe-profile-app></mfe-profile-app>`, mountPoint);
  }
};

export const unmount: MicroFrontendLifecycleFn = async ({ name: appName }) => {
  const mountPoint = getMountPoint(appName);
  if (mountPoint) {
    mountPoint.replaceChildren();
  }
};
