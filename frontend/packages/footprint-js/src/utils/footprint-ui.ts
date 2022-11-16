import type { FootprintAppearance } from '../footprint-js.types';

const CONTAINER_ID = 'footprint-container';
const OVERLAY_ID = 'footprint-overlay';
const LOADING_INDICATOR_ID = 'footprint-loading-indicator';
const CUSTOM_STYLES_ID = 'footprint-custom-styles';

const injectStylesToCurrentPage = (styles: string) => {
  if (typeof window === 'undefined') return;
  const prevStyle = document.getElementById(CUSTOM_STYLES_ID);
  if (prevStyle) {
    prevStyle.remove();
  }
  const style = document.createElement('style');
  style.setAttribute('id', 'footprint-custom-styles');
  style.textContent = styles;
  document.head.append(style);
};

const addStyleRule = (selector: string, value?: any) =>
  value ? `${selector}: ${value}` : '';

export const injectStyles = ({ variables = {} }: FootprintAppearance) => {
  injectStylesToCurrentPage(`
    :root {
      ${addStyleRule('--fp-fp-button-height', variables.fpButtonHeight)}
      ${addStyleRule(
        '--fp-fp-button-border-radius',
        variables.fpButtonBorderRadius,
      )}
      ${addStyleRule('--fp-loading-bg', variables.loadingBg)}
      ${addStyleRule('--fp-loading-color', variables.loadingColor)}
      ${addStyleRule(
        '--fp-loading-border-radius',
        variables.loadingBorderRadius,
      )}
      ${addStyleRule('--fp-loading-padding', variables.loadingPadding)}
      ${addStyleRule('--fp-overlay-bg', variables.overlayBg)}
    }
  `);
};

export const createButton = (container: HTMLElement): HTMLButtonElement => {
  const button = createFootprintButton();
  container.appendChild(button);
  return button;
};

export const showOverlay = (container: HTMLElement) => {
  document.body.classList.add('footprint-body-locked');
  const overlay = document.createElement('div');
  overlay.setAttribute('id', OVERLAY_ID);
  const loadingIndicator = createLoadingIndicator(LOADING_INDICATOR_ID);
  overlay.appendChild(loadingIndicator);
  overlay.classList.add('footprint-overlay');
  container.appendChild(overlay);
};

export const removeLoader = () => {
  const loader = document.getElementById(LOADING_INDICATOR_ID);
  if (loader) {
    loader.remove();
  }
};

export const hideOverlay = () => {
  document.body.classList.remove('footprint-body-locked');
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
};

export const createContainer = (): HTMLElement => {
  const possibleContainer = document.getElementById(CONTAINER_ID);
  if (possibleContainer) {
    return possibleContainer;
  }
  const container = document.createElement('div');
  container.setAttribute('id', CONTAINER_ID);
  document.body.appendChild(container);
  return container;
};

export const createLoadingIndicator = (loaderId: string) => {
  const container = document.createElement('div');
  container.setAttribute('id', loaderId);
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

export const createFootprintLogoIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24px');
  svg.setAttribute('height', '24px');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M14.66 14h2.666v-2.36a2.666 2.666 0 1 1 0-4.614V4H6.66v16h4.666v-2.666A3.333 3.333 0 0 1 14.66 14Z',
  );
  path.setAttribute('fill', '#76fb8f');
  svg.appendChild(path);
  return svg;
};

export const createFootprintButton = () => {
  const icon = createFootprintLogoIcon();
  const button = document.createElement('button');
  button.appendChild(icon);
  const text = document.createElement('span');
  text.innerText = 'Verify with Footprint';
  button.appendChild(text);
  button.classList.add('footprint-button');
  return button;
};
