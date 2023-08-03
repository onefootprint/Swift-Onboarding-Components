const INLINE_CONTAINER_CLASS = 'footprint-inline-container';
const BODY_LOCKED_CLASS = 'footprint-body-locked';
const OVERLAY_CLASS = 'footprint-overlay';

const OVERLAY_CONTAINER_ID_PREFIX = 'footprint-overlay-container';
const INLINE_CONTAINER_ID_PREFIX = INLINE_CONTAINER_CLASS;
const OVERLAY_ID_PREFIX = OVERLAY_CLASS;
const LOADING_INDICATOR_ID_PREFIX = 'footprint-loading-indicator';

export const getDomElementId = (elementId: string, uniqueId: string) =>
  `${elementId}-${uniqueId}`;

export const getUniqueDomId = () => {
  // Generate a unique ID for DOM elements to avoid collisions between different footprint components
  const randomSeed = Math.floor(Math.random() * 1000);
  return `${randomSeed}`;
};

export const removeDOMElements = (uniqueId: string) => {
  removeLoader(uniqueId);
  removeInlineContainer(uniqueId);
  removeOverlay(uniqueId);
  removeOverlayContainer(uniqueId);
};

export const createOverlayContainer = (uniqueId: string) => {
  const id = getDomElementId(OVERLAY_CONTAINER_ID_PREFIX, uniqueId);
  const possibleContainer = document.getElementById(id);
  if (possibleContainer) {
    return possibleContainer;
  }
  const container = document.createElement('div');
  container.setAttribute('id', id);
  document.body.appendChild(container);
  return container;
};

const removeOverlayContainer = (uniqueId: string) => {
  const id = getDomElementId(OVERLAY_CONTAINER_ID_PREFIX, uniqueId);
  const overlayContainer = document.getElementById(id);
  if (overlayContainer) {
    overlayContainer.remove();
  }
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

export const removeLoader = (uniqueId: string) => {
  const id = getDomElementId(LOADING_INDICATOR_ID_PREFIX, uniqueId);
  const loader = document.getElementById(id);
  if (loader) {
    loader.remove();
  }
};

export const createLoader = (container: HTMLElement, uniqueId: string) => {
  const id = getDomElementId(LOADING_INDICATOR_ID_PREFIX, uniqueId);
  const loadingIndicator = createLoadingIndicator(id);
  container.appendChild(loadingIndicator);
};

export const createOverlay = (container: HTMLElement, uniqueId: string) => {
  document.body.classList.add(BODY_LOCKED_CLASS);
  const overlay = document.createElement('div');
  const id = getDomElementId(OVERLAY_ID_PREFIX, uniqueId);
  overlay.setAttribute('id', id);
  overlay.classList.add(OVERLAY_CLASS);
  container.appendChild(overlay);
  return overlay;
};

const removeOverlay = (uniqueId: string) => {
  document.body.classList.remove(BODY_LOCKED_CLASS);
  const id = getDomElementId(OVERLAY_ID_PREFIX, uniqueId);
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.remove();
  }
};

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
