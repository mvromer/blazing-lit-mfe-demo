import singleSpaBlazor from 'blazor-wasm-single-spa';
import mudBlazorExtension from 'blazor-wasm-ext-mud-blazor';

// Build the asset base URL from this JavaScript module's URL. The asset base URL must have a
// trailing slash for Blazor to apply it correctly.
const iLastSlash = import.meta.url.lastIndexOf('/');
const assetBaseUrl = import.meta.url.substring(0, iLastSlash + 1);

export const { bootstrap, mount, unmount } = singleSpaBlazor({
  appTagName: 'mfe-orders-app',
  assetBaseUrl,
  appExtensions: [mudBlazorExtension],
});
