import { navigateToUrl, registerApplication, start } from 'single-spa';
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from 'single-spa-layout';

connectNavItems();
loadMicroFrontends();

function connectNavItems() {
  document
    .querySelectorAll('.mfe-nav-item')
    .forEach((navItem) =>
      navItem.addEventListener('click', (e) => navigateToUrl(e as any))
    );
}

function loadMicroFrontends() {
  const appLayout = document.querySelector('#app-layout');
  const routes = constructRoutes(appLayout);
  const applications = constructApplications({
    routes,
    loadApp({ name }) {
      return import(/* @vite-ignore */ `@mfe-demo/${name}`);
    },
  });

  constructLayoutEngine({ routes, applications });
  applications.forEach(registerApplication);
  start();
}
