import { registerApplication, start } from 'single-spa';
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine
} from 'single-spa-layout';

const appLayout = document.querySelector('#app-layout');
const routes = constructRoutes(appLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return import(/* @vite-ignore */ `@mfe-demo/${name}`);
  }
});

const layoutEngine = constructLayoutEngine({ routes, applications });
applications.forEach(registerApplication);
start();
