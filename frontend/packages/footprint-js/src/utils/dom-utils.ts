const INLINE_CONTAINER_CLASS = 'footprint-inline-container';
const BODY_LOCKED_CLASS = 'footprint-body-locked';
const OVERLAY_CLASS = 'footprint-overlay';

const OVERLAY_CONTAINER_ID_PREFIX = 'footprint-overlay-container';
const INLINE_CONTAINER_ID_PREFIX = INLINE_CONTAINER_CLASS;
const OVERLAY_ID_PREFIX = OVERLAY_CLASS;
const LOADING_INDICATOR_ID_PREFIX = 'footprint-loading-indicator';

export const getOverlayContainerId = (uniqueId: string) =>
  `${OVERLAY_CONTAINER_ID_PREFIX}-${uniqueId}`;

export const getDomElementId = (elementId: string, uniqueId: string) =>
  `${elementId}-${uniqueId}`;

export const removeDOMElements = async (uniqueId: string) => {
  removeLoader(uniqueId);
  removeInlineContainer(uniqueId);
  await removeOverlayContainer(uniqueId);
};

/** @deprecated: import { appendOverlayContainer } from `@onefootprint/core` */
export const createOverlayContainer = (uniqueId: string): HTMLElement => {
  const id = getOverlayContainerId(uniqueId);
  const possibleContainer = document.getElementById(id);
  if (possibleContainer) {
    return possibleContainer;
  }
  const container = document.createElement('div');
  container.setAttribute('id', id);
  document.body.appendChild(container);
  return container;
};

const removeOverlayContainer = async (uniqueId: string) => {
  const id = getOverlayContainerId(uniqueId);
  const overlayContainer = document.getElementById(id);
  if (!overlayContainer) {
    return;
  }
  const drawerIframe = overlayContainer.querySelector(
    'iframe.footprint-drawer',
  );
  if (drawerIframe) {
    drawerIframe?.classList.add('footprint-drawer-closing');
    await new Promise(resolve => {
      setTimeout(resolve, 300); // Wait for animation to finish
    });
  }
  const modalIframe = overlayContainer.querySelector('iframe.footprint-modal');
  if (modalIframe) {
    modalIframe?.classList.add('footprint-modal-closing');
    await new Promise(resolve => {
      setTimeout(resolve, 100); // Wait for animation to finish
    });
  }

  const overlayId = getDomElementId(OVERLAY_ID_PREFIX, uniqueId);
  const overlay = document.getElementById(overlayId);
  if (!overlay) {
    return;
  }
  overlay.classList.add('footprint-overlay-fading');
  await new Promise(resolve => {
    setTimeout(resolve, 200); // Wait for animation to finish
  });
  overlayContainer.remove();
  overlay.remove();

  document.body.classList.remove(BODY_LOCKED_CLASS);
};

export const createInlineContainer = (
  uniqueId: string,
  clientParentContainer: HTMLElement,
) => {
  const id = getDomElementId(INLINE_CONTAINER_ID_PREFIX, uniqueId);
  const inlineContainer = document.createElement('div');
  inlineContainer.classList.add(INLINE_CONTAINER_CLASS);
  inlineContainer.setAttribute('id', id);
  clientParentContainer.appendChild(inlineContainer);
  return inlineContainer;
};

const removeInlineContainer = (uniqueId: string) => {
  const id = getDomElementId(INLINE_CONTAINER_ID_PREFIX, uniqueId);
  const inlineContainer = document.getElementById(id);
  if (inlineContainer) {
    inlineContainer.remove();
  }
};

/** @deprecated: import { removeLoadingIndicator } from `@onefootprint/core` */
export const removeLoader = (uniqueId: string) => {
  const id = getDomElementId(LOADING_INDICATOR_ID_PREFIX, uniqueId);
  const loader = document.getElementById(id);
  if (loader) {
    loader.remove();
  }
};

/** @deprecated: import { appendLoadingIndicator } from `@onefootprint/core` */
export const createLoader = (container: HTMLElement, uniqueId: string) => {
  const id = getDomElementId(LOADING_INDICATOR_ID_PREFIX, uniqueId);
  const loadingIndicator = createLoadingIndicator(id);
  container.appendChild(loadingIndicator);
};

/** @deprecated: import { appendOverlay } from `@onefootprint/core` */
export const createOverlay = (container: HTMLElement, uniqueId: string) => {
  document.body.classList.add(BODY_LOCKED_CLASS);
  const overlay = document.createElement('div');
  const id = getDomElementId(OVERLAY_ID_PREFIX, uniqueId);
  overlay.setAttribute('id', id);
  overlay.classList.add(OVERLAY_CLASS);
  container.appendChild(overlay);
  return overlay;
};

/** @deprecated: import { createLoadingIndicator } from `@onefootprint/core` */
const createLoadingIndicator = (id: string) => {
  const container = document.createElement('div');
  container.setAttribute('id', id);
  container.classList.add('footprint-loading-indicator');
  const inner = document.createElement('div');
  inner.classList.add('footprint-loading-spin');
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

// TODO we could make these transitions prettier
export const showContainer = (id: string) => {
  const container = document.getElementById(getOverlayContainerId(id));
  if (container) {
    container.style.opacity = '1';
    container.style.display = 'block';
  }
};

export const hideContainer = (id: string) => {
  const container = document.getElementById(getOverlayContainerId(id));
  if (container) {
    container.style.opacity = '0';
    container.style.display = 'none';
  }
};
