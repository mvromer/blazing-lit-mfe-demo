import { html, render } from 'lit';

import type { LifeCycleFn } from 'single-spa';

import './profile-app.js';

function getMountPoint(appName: string) {
  return document.getElementById(`single-spa-application:${appName}`);
}

export const bootstrap: LifeCycleFn<never> = () => {
  return Promise.resolve();
};

export const mount: LifeCycleFn<never> = async ({ name: appName }) => {
  const mountPoint = getMountPoint(appName);

  if (mountPoint) {
    render(html`<mfe-profile-app></mfe-profile-app>`, mountPoint);
  }
};

export const unmount: LifeCycleFn<never> = async ({ name: appName }) => {
  const mountPoint = getMountPoint(appName);
  if (mountPoint) {
    mountPoint.innerHTML = '';
  }
};
