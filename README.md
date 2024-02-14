# Blazing Lit Micro-Frontend Demo

A proof-of-concept demonstrating experimental support for Blazor WebAssembly (WASM) micro-frontends
loaded in a simple web app built using [single-spa](https://single-spa.js.org/). The app comprises
three components:

* An app shell managing overall page layout and micro-frontend lifecycles
* A Profile micro-frontend written using [Lit](https://lit.dev/)
* A Catalog micro-frontend written using [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor)

## Background

Lit and other popular JavaScript frameworks are largely well-supported for developing
micro-frontends using single-spa; Blazor historically has not been. In this demo, using a Blazor
WASM micro-frontend is made possible using two experimental packages I created:

* [Blazor.WebAssembly.SingleSpa](https://www.nuget.org/packages/Blazor.WebAssembly.SingleSpa) &ndash;
  NuGet package that provides a modified Blazor WASM start script (`blazor.webassembly.js`). This
  modifies the `Blazor` object created by the Blazor WASM runtime to expose additional APIs and
  startup options enabling better management over the lifecycle, navigation, and resource loading of
  a Blazor WASM application.
* [blazor-wasm-single-spa](https://www.npmjs.com/package/blazor-wasm-single-spa) &ndash; NPM package
  providing an experimental single-spa framework helper for Blazor WebAssembly. This helper creates
  the three lifecycle hooks single-spa expects each micro-frontend to export for bootstrapping,
  mounting, and unmounting itself.

This is not necessarily meant to demonstrate a robust and production-ready implementation of a
Blazor WASM micro-frontend but rather is a demo of what could be conceptually possible. Ideally,
Blazor (at least its WebAssembly variant) would eventually evolve to more readily support the
micro-frontend use case as detailed in
[dotnet/aspnetcore#38128](https://github.com/dotnet/aspnetcore/issues/38128).

## Demo Parts

This demo comprises three separately deployed applications:

* A vanilla HTML, CSS, and JS application shell that loads the site and manages the lifecycle of
  each micro-frontend.
* A Lit-based micro frontend that renders a user profile page.
* A Blazor-based micro frontend that renders a catalog page. It also features client-side routing
  internal to the micro-frontend that goes from a catalog view to a detail view of a specific item.

## Live Demo

A live instance of this demo is hosted on the free tier of Azure Static Web Apps (SWA). The app
shell and each micro-frontend are hosted on their own Azure SWA instance, so technically they are
served from different origins. The application shell can be accessed
[here](https://gentle-river-0e21e6610.3.azurestaticapps.net/).

## Blazor WASM Micro-frontend Setup

The Blazor WASM micro-frontend is based on the `blazorwasm-empty` template. This is done via the
dotnet CLI:

```powershell
dotnet new blazorwasm-empty -o CatalogApp
```

After creating the new project, the [Blazor.WebAssembly.SingleSpa](https://www.nuget.org/packages/Blazor.WebAssembly.SingleSpa)
NuGet package is added to the project. This will provide a variant of the Blazor WebAssembly start
script (`blazor.webassembly.js`) that ships by default with the .NET SDK. The provided version
exposes additional APIs and startup options that facilitate repeatedly mounting and unmounting
Blazor WASM applications from the DOM via single-spa.

```powershell
dotnet add package Blazor.WebAssembly.SingleSpa
```

A single-spa micro frontend must expose a JavaScript module that exports a number of lifecycle
hooks called by single-spa. The Blazor WASM micro-frontend defines a `lifecycles.js` file in its
`wwwroot` file and uses the [blazor-wasm-single-spa](https://www.npmjs.com/package/blazor-wasm-single-spa)
framework helper to assist in defining these lifecycle hooks.

For the framework helper to successfully mount the Blazor WASM application to the DOM, the
application needs to register its `App` root component as a custom element. To support this, we need
add the Microsoft.AspNetCore.Components.CustomElements package to the project:

```
dotnet add package Microsoft.AspNetCore.Components.CustomElements
```

We then need to add the following line to the Program.cs file to actually add support for the custom
element:

```csharp
builder.RootComponents.RegisterCustomElement<App>("mfe-catalog-app");
```

To ensure the Blazor WASM framework helper can properly unmount the Blazor micro-frontend when the
user navigates away from it to a different micro-frontend, we remove the lines that register the
`App` and `HeadOutlet` with DOM selectors:

```csharp
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
```

To define the required lifecycle hooks, lifecycles module imports the framework helper and calls its
`singleSpaBlazor` function, exporting the hooks it returns:

```javascript
import singleSpaBlazor from 'blazor-wasm-single-spa';

const iLastSlash = import.meta.url.lastIndexOf('/');
const assetBaseUrl = import.meta.url.substring(0, iLastSlash + 1);

export const { bootstrap, mount, unmount } = singleSpaBlazor({
  appTagName: 'mfe-catalog-app',
  stylePaths: ['CatalogApp.styles.css'],
  assetBaseUrl,
});
```

To avoid bundling the framework helper with the micro-frontend, the lifecycles module leaves its
import statements untouched with bare module specifiers, and the app shell defines an import map
that knows how to resolve these bare specifiers to actual URLs at runtime. This is but one method of
sharing common dependencies across multiple micro-frontends.

The above demonstrates also how to incorporate stylesheets defined by the Blazor WASM application.
The path given is relative to the *asset base URL*. This is a new startup option exposed by
Blazor.WebAssembly.SingleSpa as the `assetBaseUrl` property. It defines the base URL to use when
fetching Blazor assets such as the .NET browser runtime loader (`dotnet.js`), various WebAssembly
modules, etc. It is typically set to the base URL at which your micro-frontend is hosted.

The other important startup option is the *navigation base URL*. It is exposed as the
`navigationBaseUrl` property. The navigation base URL is the base URL to use for client-side routing
purposes within your micro-frontend. In the context of a Blazor WASM micro-frontend, this is used to
properly configure Blazor's navigation manager.

While this could be set statically in the call to `singleSpaBlazor`, it's typical to define the
navigation base URL based on information passed down from the app shell to the micro-frontend via
the props passed to each lifecycle hook. For this reason, the mount hook returned by
`singleSpaBlazor` will also use any `navigationBaseUrl` prop it receives. This prop takes precedence
over the navigation base URL (if any) passed to `singleSpaBlazor`.

Due to how the .NET browser runtime forms some of its `fetch` requests for .NET and Blazor assets,
namely how it configure the request to include credentials, it is important that the origin serving
your Blazor WASM micro-frontend serves up the correct CORS headers if the origin does not match the
origin of the app-shell (as is the case in the live demo linked above). In particular, since some
requests are configured to include credentials for cross-origin requests, it's important that the
Blazor WASM micro-frontend's origin responds with at least the following CORS response headers:

```
Access-Control-Allow-Origin: <origin of your app shell>
Access-Control-Allow-Credentials: true
```

Note that the Access-Control-Allow-Origin header **cannot** specify a wildcard because the spec
expressly forbids this when the request includes credentials.

The Blazor WASM micro-frontend in this demo uses Azure Static Web Apps and thus defines these CORS
headers inside its [staticwebapp.config.json](catalog/src/CatalogApp/wwwroot/staticwebapp.config.json).

## Preparing a Blazor Micro Frontend for Deployment

For the most part, building the Blazor-based micro frontend and preparing it for deployment should
be no different than other standalone Blazor WebAssembly applications. Most of the work is done via
the `dotnet publish` command:

```powershell
dotnet publish -c Release -o dist
```

The static content that needs to be uploaded is located in `dist/wwwroot`. The `lifecycles.js` file
that needs to be loadable by single-spa is located in this `wwwroot` folder.
