/**
 * Creates a loading indicator element with the specified ID.
 *
 * @param {string} id - The unique identifier for the loading indicator.
 * @return {HTMLElement} The created loading indicator element.
 */
const createLoadingIndicator = (id: string): HTMLElement => {
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

/**
 * Removes the loading indicator element with the specified ID from the DOM.
 *
 * @param {string} uId - The unique identifier for the loading indicator.
 * @return {void} This function does not return a value.
 */
const removeLoadingIndicator = (uId: string): void => {
  const id = `footprint-loading-indicator-${uId}`;
  const loader = document.getElementById(id);
  if (loader) {
    loader.remove();
  }
};

/**
 * Creates an overlay element and appends it to the specified container.
 *
 * @param {string} uId - The initial ID for the overlay element.
 * @param {HTMLElement} container - The container element to which the overlay will be appended.
 * @return {HTMLElement} The created overlay element.
 */
const appendOverlay = (uId: string, container: HTMLElement): HTMLElement => {
  const id = `footprint-overlay-${uId}`;
  // Lock the body to prevent scrolling
  document.body.classList.add('footprint-body-locked');
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.setAttribute('id', id);
  overlay.classList.add('footprint-overlay');
  // Append overlay to the specified container
  if (container) {
    container.appendChild(overlay);
  }
  return overlay;
};

/**
 * Appends a loading indicator element to the specified container element.
 *
 * @param {string} uId - The unique identifier for the loading indicator.
 * @param {HTMLElement} container - The container element to which the loading indicator will be appended.
 * @return {void} This function does not return a value.
 */
const appendLoadingIndicator = (uId: string, container: HTMLElement) => {
  const id = `footprint-loading-indicator-${uId}`;
  const loadingIndicator = createLoadingIndicator(id);
  container.appendChild(loadingIndicator);
};

/**
 * Removes the overlay container and overlay elements associated with the given unique identifier.
 *
 * @param {string} uId - The unique identifier for the overlay container and overlay elements.
 * @return {void} This function does not return a value.
 */
const removeOverlayContainer = (uId: string): void => {
  const containerId = `footprint-overlay-container-${uId}`;
  const overlayContainer = document.getElementById(containerId);
  if (overlayContainer) {
    overlayContainer.remove();
  }

  const overlayId = `footprint-overlay-${uId}`;
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.remove();
  }

  document.body.classList.remove('footprint-body-locked');
};

/**
 * Removes the inline container element with the specified unique identifier.
 *
 * @param {string} uId - The unique identifier for the inline container element.
 * @return {void} This function does not return a value.
 */
const removeInlineContainer = (uId: string) => {
  const id = `footprint-inline-container-${uId}`;
  const inlineContainer = document.getElementById(id);
  if (inlineContainer) {
    inlineContainer.remove();
  }
};

/**
 * Appends loading elements to the specified container element.
 *
 * @param {string} uId - The unique identifier for the loading elements.
 * @param {HTMLElement} container - The container element to which the loading elements will be appended.
 * @return {void} This function does not return a value.
 */
export const appendLoadingElements = (uId: string, container: HTMLElement) => {
  appendLoadingIndicator(uId, appendOverlay(uId, container));
};

/**
 * Removes DOM elements associated with the given unique identifier.
 *
 * @param {string} uId - The unique identifier for the DOM elements.
 * @return {void} This function does not return a value.
 */
export const removeOverlayAndLoading = (uId: string) => {
  removeLoadingIndicator(uId);
  removeOverlayContainer(uId);
  removeInlineContainer(uId);
};

/**
 * Creates an overlay container element with a unique ID and appends it to the document body.
 *
 * @param {string} uId - The unique identifier for the overlay container.
 * @return {HTMLElement} The created overlay container element.
 */
export const appendOverlayContainer = (uId: string): HTMLElement => {
  const id = `footprint-overlay-container-${uId}`;
  let overlayContainer = document.getElementById(id);

  if (!overlayContainer) {
    overlayContainer = document.createElement('div');
    overlayContainer.setAttribute('id', id);
    document.body.appendChild(overlayContainer);
  } else {
    overlayContainer.innerHTML = '';
  }

  return overlayContainer;
};

/**
 * Creates and appends an inline container element to a specified parent element.
 *
 * @param {string} uId - The unique identifier for the inline container.
 * @param {string} [containerId] - The ID of the parent element where the inline container will be appended.
 * @return {HTMLElement} The created inline container element.
 */
export const appendInlineContainer = (uId: string, containerId?: string) => {
  if (!containerId) throw new Error('No element id provided');

  const clientParent = document.getElementById(containerId);
  if (!clientParent) throw new Error(`Could not find element with id ${containerId}`);

  const id = `footprint-inline-container-${uId}`;
  const inlineContainer = document.createElement('div');

  inlineContainer.classList.add('footprint-inline-container');
  inlineContainer.setAttribute('id', id);
  inlineContainer.innerHTML = '';
  clientParent.appendChild(inlineContainer);

  return inlineContainer;
};

/**
 * Appends an inline loader element to the specified container element.
 *
 * @param {string} uId - The unique identifier for the inline loader element.
 * @param {HTMLElement} container - The container element to which the loader will be appended.
 */
export const appendInlineLoader = (uId: string, container: HTMLElement) => {
  const id = `footprint-loading-indicator-${uId}`;
  const loadingIndicator = createLoadingIndicator(id);
  container.appendChild(loadingIndicator);
};
