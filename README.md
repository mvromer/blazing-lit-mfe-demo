# Blazing Lit Micro Frontend Demo

A simple web app built using [single-spa](https://single-spa.js.org/). It demonstrates loading micro
frontends written with the following:

* [Lit](https://lit.dev/)
* [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor)

The former (along with other popular JavaScript frameworks) is well-supported; the latter
historically has not been. In this demo, using a Blazor WebAssembly micro frontend is made possible
using an experimental NuGet package I created,
[Blazor.WebAssembly.SingleSpa](https://www.nuget.org/packages/Blazor.WebAssembly.SingleSpa).

This is not necessarily meant to demonstrate a robust and production-ready implementation of a
Blazor-based micro frontend but rather is a demo of what could be conceptually possible. Ideally,
Blazor (at least its WebAssembly variant) would eventually evolve to more readily support the micro
frontend use case.

## Blazor Micro Frontend Setup

The Blazor-based micro frontend is based on the `blazorwasm-empty` template. This is done via the
dotnet CLI:

```powershell
dotnet new blazorwasm-empty -o CatalogApp
```

After creating the new project, the [Blazor.WebAssembly.SingleSpa](https://www.nuget.org/packages/Blazor.WebAssembly.SingleSpa)
is added to incorporate a modified Blazor WebAssembly startup script that facilitates loading Blazor
applications in single-spa.

```powershell
dotnet add package Blazor.WebAssembly.SingleSpa
```

A single-spa micro frontend must expose a JavaScript module that exports a number of lifecycle
callbacks called by single-spa. The Blazor-based micro frontend sets up a lightweight Vite project
configured to do a library build that ultimately produces this module. It then uses
[Microsoft.AspNetCore.ClientAssets](https://www.nuget.org/packages/Microsoft.AspNetCore.ClientAssets/0.1.0-alpha.21528.2)
package to integrate the Vite build process and capture its output as part of Blazor's build
process. The following are done from the `catalog/src/CatalogApp` directory:

```powershell
mkdir js
dotnet add package Microsoft.AspNetCore.ClientAssets
cd js
npm create vite@latest .
npm install
npm install --save single-spa lit
npm install --save-dev npm-run-all2
```

This installs the single-spa and lit packages in the Vite project. These are for accessing type
declarations and additional functions used to mount/unmount the Blazor micro frontend from the
single-spa lifecycle callbacks. The npm-run-all2 will help with the integration between the Blazor
and Vite build processes.

The C# project file for the Blazor micro frontend also needs to add the following properties so that
the Blazor build knows where the Vite project is located:

```xml
<PropertyGroup>
  <ClientAssetsDirectory>js</ClientAssetsDirectory>
  <ClientAssetsBuildOutputParameter>--outDir</ClientAssetsBuildOutputParameter>
</PropertyGroup>
```

The Microsoft.AspNetCore.ClientAssets package will call one of two npm run scripts depending on if
the Blazor build is doing a debug or a release build. To support this, add the following npm run
scripts the Vite project's package.json:

```json
{
  "scripts": {
    "build:Debug": "run-s \"build -- {@} --emptyOutDir\" --",
    "build:Release": "run-s \"build -- {@} --emptyOutDir\" --"
  }
}
```

These basically defer to the default `build` npm run script created when the Vite project was first
created.

In this particular demo, we register a custom element that we use when mounting the Blazor-based
micro frontend. To support this, we need to add the Microsoft.AspNetCore.Components.CustomElements
package:

```
dotnet add package Microsoft.AspNetCore.Components.CustomElements
```

We then need to add the following line to the Program.cs file to actually add support for the custom
element:

```csharp
builder.RootComponents.RegisterCustomElement<App>("mfe-catalog-app");
```

When the Blazor micro frontend needs to mount itself, it simply needs to render the
`<mfe-catalog-app></mfe-catalog-app>` HTML to its mount point in the DOM. In this demo, I also do
some extra work to ensure the styles defined within the Blazor WebAssembly project are also
incorporated when the micro frontend is mounted.

## Preparing a Blazor Micro Frontend for Deployment

For the most part, building the Blazor-based micro frontend and preparing it for deployment should
be no different than other standalone Blazor WebAssembly applications. Most of the work is done via
the `dotnet publish` command:

```powershell
dotnet publish -c Release -o dist
```

The static content that needs to be uploaded is located in `dist/wwwroot`. The `index.js` file that
needs to be loadable by single-spa is located in this `wwwroot` folder.
