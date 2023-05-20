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
