import { html, render } from 'lit';

import type { LifeCycleFn } from 'single-spa';

// Ideally these types and the getMountPoint function would be factored into some shared JavaScript
// package.
type CustomAppProps = {
  appBaseUri: string;
};

type MicroFrontendLifecycleFn = LifeCycleFn<CustomAppProps>;

function getMountPoint(appName: string) {
  return document.getElementById(`single-spa-application:${appName}`);
}

function getResourceBaseUri() {
  // Build the resource base URI from this JavaScript module's URL. Note that Blazor requires base
  // URIs to have a trailing slash in order for the Blazor runtime to correctly resolve relative
  // resource URLs referenced by the Blazor startup script.
  const iLastSlash = import.meta.url.lastIndexOf('/');
  return import.meta.url.substring(0, iLastSlash + 1);
}

function getDocumentStyleSheet() {
  // Adapted from: https://developer.mozilla.org/en-US/docs/Web/API/StyleSheetList#get_all_css_rules_for_the_document_using_array_methods
  // Doesn't include additional error handling for brevity sake.
  //
  // Arguably a smarter and more resource efficient way of handling this would be for the app shell
  // to construct the CSSStyleSheet object representing the app's "global" styles that can be merged
  // in with a micro frontend via adoptedStyleSheets. The app shell could then pass that sheet down
  // as a custom prop in the single-spa lifecycle callbacks.
  const sheetContents = Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules))
    .map((rule) => rule.cssText)
    .join('');

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(sheetContents);
  return sheet;
}

async function getBlazorStyleSheet(sheetResourceName: string) {
  // NOTE: Error handling deliberately removed for brevity sake.
  const resourceBaseUri = getResourceBaseUri();
  const sheetUri = new URL(sheetResourceName, resourceBaseUri).href;
  const sheet = new CSSStyleSheet();
  const sheetContents = await fetch(sheetUri);
  sheet.replaceSync(await sheetContents.text());
  return sheet;
}

// .NET and Blazor runtime objects created by this micro frontend's startup script.
let blazor: any = undefined;
// @ts-ignore 'dotnet' is declared but its value is never read.
let dotnet: any = undefined;

// The actual single-spa lifecycle callbacks.

export const bootstrap: MicroFrontendLifecycleFn = async ({
  name: appName,
  appBaseUri,
}) => {
  const resourceBaseUri = getResourceBaseUri();

  // Import the Blazor startup script responsible for loading the .NET runtime in the browser along
  // with the actual Blazor runtime. Both runtime objects are encapsulated within the startup
  // script and are exposed on the window object after the script has executed. We will want to
  // capture a reference to these objects after the script has loaded.
  //
  // NOTE: There is quite possibly a race condition here if more than one Blazor-based micro
  // frontend is loading at the same time using this approach. Consider if two different
  // Blazor-based micro frontends (M1 and M2) have their bootstrap callback invoked back-to-back. M1
  // will start its import of its Blazor startup script, and its continuation will be set to run
  // sometime after the script has been imported and executed.
  //
  // While M1 is importing, M2 could have the initial part of its bootstrap callback scheduled and
  // executed. It, too, will start the import of its Blazor startup script.
  //
  // Suppose the following sequence occurs:
  //
  //   1. M1 fetches its startup script
  //   2. M2 fetches its startup script
  //   3. M1 executes its startup script, writing to the window.Blazor and window.DotNet objects.
  //   4. M2 executes its startup script, writing to the window.Blazor and window.DotNet objects.
  //   5. M1's bootstrap continuation executes, capturing the window.Blazor and window.DotNet objects.
  //
  // In this case, M1 ends up with references to the wrong objects.
  //
  // It is unclear to me if this behavior would actually occur given current browser or JavaScript
  // engine implementations. However, it seems plausible and would highlight a constraint currently
  // present with Blazor-based micro frontends using this approach. However, this seems like it
  // should be something that could be addressed relatively easily on the Blazor side by making it
  // possible to retrieve the DotNet and Blazor objects through some mechanism other than the global
  // window object.
  const blazorStartupScriptUrl = new URL(
    '_framework/blazor.webassembly.js',
    resourceBaseUri
  ).href;
  await import(blazorStartupScriptUrl);

  blazor = window.Blazor;
  dotnet = window.DotNet;

  // Technically we could probably return the Promise returned by start, but awaiting here would
  // allow us to do some additional one-time initialization inside our Blazor micro frontend, such
  // as calling static methods that capture references to JavaScript objects we want to reference
  // from Blazor's JSInterop.
  console.log(appBaseUri);
  await blazor.start({
    appBaseUri,
    resourceBaseUri,
    resourceCacheName: appName,
    // Assume the resources are served from a different origin that allows access to any origin via
    // a wildcard. In that case, we CANNOT send credentials to the resource origin.
    resourceFetchCredentialMode: 'omit',
  });
};

export const mount: MicroFrontendLifecycleFn = async ({ name: appName }) => {
  // Enable the Blazor micro frontend's navigation listeners and force the Blazor to resync with the
  // page's current URL before mounting the application.
  blazor.addNavigationEventListeners();
  blazor.navigateTo(document.location.href, {
    replaceHistoryEntry: true,
    forceLoad: false,
  });

  const mountPoint = getMountPoint(appName);
  if (mountPoint) {
    // In order to incorporate the Blazor micro frontend's styles, we fetch them from the resource
    // origin. We then create a new shadow root within our mount point and add the fetched styles to
    // the shadow root's adopted style sheets. In order to easily incorporate any "global" styles
    // the app shell defines within the created shadow DOM, we also pull in the document's styles.
    // We then render the Blazor micro frontend within the mount point's shadow root.
    //
    // NOTE: Safari users will need to be on 16.4 or later as supported for the adoptedStyleSheets
    // API and constructible style sheets was only recently implemented.
    //
    // NOTE 2: This approach presumes the Blazor micro frontend defined its styles using Blazor's
    // CSS isolation. That's not strictly necessary, and almost any style sheet that can be fetched
    // from the resource origin can be adopted (limits like not being to use @import rules in the
    // fetched style sheet exist currently). That said, use whatever approach makes sense for your
    // project.
    const shadowRoot = mountPoint.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [
      getDocumentStyleSheet(),
      await getBlazorStyleSheet('CatalogApp.styles.css'),
    ];

    render(html`<mfe-catalog-app></mfe-catalog-app>`, shadowRoot);
  }
};

export const unmount: MicroFrontendLifecycleFn = async ({ name: appName }) => {
  const mountPoint = getMountPoint(appName);
  if (mountPoint) {
    mountPoint.innerHTML = '';
  }

  // Disable Blazor's navigation event listeners so that they don't try to process routes meant for
  // other micro frontends.
  blazor.removeNavigationEventListeners();
};
