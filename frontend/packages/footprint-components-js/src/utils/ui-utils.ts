const CONTAINER_ID = 'footprint-components-container';
const OVERLAY_ID = 'footprint-components-overlay';
const LOADING_INDICATOR_ID = 'footprint-components-loading-indicator';
const INLINE_LOADER_CONTAINER_ID = 'footprint-components-inline-loader';

export const createLoader = (container: HTMLElement) => {
  const loadingIndicator = createLoadingIndicator(LOADING_INDICATOR_ID);
  container.appendChild(loadingIndicator);
};

export const removeLoader = () => {
  const loader = document.getElementById(LOADING_INDICATOR_ID);
  if (loader) {
    loader.remove();
  }
};

export const createInlineLoaderContainer = (container: HTMLElement) => {
  const loaderContainer = document.createElement('div');
  loaderContainer.classList.add(INLINE_LOADER_CONTAINER_ID);
  loaderContainer.setAttribute('id', INLINE_LOADER_CONTAINER_ID);
  container.appendChild(loaderContainer);
  return loaderContainer;
};

export const removeInlineLoaderContainer = () => {
  const inlineLoaderContainer = document.getElementById(
    INLINE_LOADER_CONTAINER_ID,
  );
  if (inlineLoaderContainer) {
    inlineLoaderContainer.remove();
  }
};

export const createOverlay = (container: HTMLElement) => {
  document.body.classList.add('footprint-components-body-locked');
  const overlay = document.createElement('div');
  overlay.setAttribute('id', OVERLAY_ID);
  overlay.classList.add('footprint-components-overlay');
  container.appendChild(overlay);
  return overlay;
};

export const removeOverlay = () => {
  document.body.classList.remove('footprint-components-body-locked');
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
};

export const createModalContainer = (): HTMLElement => {
  const possibleContainer = document.getElementById(CONTAINER_ID);
  if (possibleContainer) {
    return possibleContainer;
  }
  const container = document.createElement('div');
  container.setAttribute('id', CONTAINER_ID);
  document.body.appendChild(container);
  return container;
};

const createLoadingIndicator = (loaderId: string) => {
  const container = document.createElement('div');
  container.setAttribute('id', loaderId);
  container.classList.add('footprint-components-loading-indicator');
  const inner = document.createElement('div');
  inner.classList.add('footprint-components-loading-spin');
  const loader = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  loader.setAttribute('width', '24px');
  loader.setAttribute('height', '24px');
  loader.setAttribute('fill', 'none');
  loader.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 2a10 10 0 0 1 10 10h-2a7.999 7.999 0 0 0-8-8V2Z');
  loader.appendChild(path);
  inner.appendChild(loader);
  container.appendChild(inner);
  return container;
};
