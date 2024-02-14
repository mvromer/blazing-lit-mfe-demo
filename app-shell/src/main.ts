import { navigateToUrl, registerApplication, start } from 'single-spa';
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from 'single-spa-layout';

import './style.css';

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
  const appLayout = document.querySelector('#app-layout')!;
  const routes = constructRoutes(appLayout);
  const applications = constructApplications({
    routes,
    loadApp({ name }) {
      return import(/* @vite-ignore */ `@mfe-demo/${name}`);
    },
  });
  constructLayoutEngine({ routes, applications });

  // Instead of relying on single-spa-layout's ability to specify props in the HTML layout and
  // define values for those props when calling constructRoutes, we manually specify each micro
  // frontend's custom props when we call single-spa's registerApplication function. The reason for
  // this is that it allows us to specify more precisely where custom props appear in the props
  // object passed to a micro frontend's lifecycle callbacks.
  const baseUrl = new URL(document.baseURI);

  applications.forEach((application) => {
    // Use the function form of custom props when registering the micro frontend's single-spa
    // application. This way if the custom props originally set for this application was a function
    // as well, we can apply the function and use it when building up the final set of custom props
    // for the micro frontend.
    const originalProps = application.customProps;

    registerApplication({
      ...application,
      customProps(appName, currentWindowLocation) {
        const resolvedProps =
          typeof originalProps === 'function'
            ? originalProps(appName, currentWindowLocation)
            : originalProps;

        return {
          ...resolvedProps,
          // For this demo, we always assume a micro frontend's base URL is at <origin>/<app-name>/.
          // This is mainly used to ensure client-side routing can get configured correctly for each
          // micro frontend. You would typically adjust based on your actual app's needs.
          appBaseUrl: `${baseUrl.origin}/${appName}/`,
        };
      },
    });
  });

  start();
}
