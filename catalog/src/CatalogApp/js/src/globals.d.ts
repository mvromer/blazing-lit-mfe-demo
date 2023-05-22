// Ideally there would be better type declarations for this. It appears there is at least a
// @microsoft/dotnet-js-interop package that might cover the DotNet object, but there doesn't appear
// to be anything that covers the Blazor object.
declare global {
  interface Window {
    Blazor: any;
    DotNet: any;
  }
}

export {};
