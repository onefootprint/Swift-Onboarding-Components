import { IframeManager, PublicEvent } from '../../iframe';
import { OpenOptions, UIManager } from '../types';
import {
  createCSSClasses,
  createLoadingIndicator,
} from './vanilla-ui-adapter.utils';

const CONTAINER_ID = 'footprint-container';
const OVERLAY_ID = 'footprint-overlay';
const LOADING_INDICATOR_ID = 'footprint-loading-indicator';
const IS_SSR = typeof window === 'undefined';

class VanillaUiAdapter implements UIManager {
  constructor(private iframeManager: IframeManager) {
    if (!IS_SSR) {
      createCSSClasses();
    }
  }

  async show({ urlHash }: OpenOptions) {
    const container = this.createContainer();
    this.showOverlay(container);
    await this.iframeManager.render({
      classList: ['footprint-modal'],
      container,
      urlHash,
    });
    this.onIframeShown();
    this.iframeManager.on('closed', () => this.close());
  }

  on(eventName: PublicEvent, callback: () => void) {
    this.iframeManager.on(eventName, callback);
  }

  close() {
    this.hideOverlay();
    this.iframeManager.destroy();
  }

  showOverlay(container: HTMLElement) {
    document.body.classList.add('footprint-body-locked');
    const overlay = document.createElement('div');
    overlay.setAttribute('id', OVERLAY_ID);
    const loadingIndicator = createLoadingIndicator(LOADING_INDICATOR_ID);
    overlay.appendChild(loadingIndicator);
    overlay.classList.add('footprint-overlay');
    container.appendChild(overlay);
  }

  onIframeShown() {
    const loader = document.getElementById(LOADING_INDICATOR_ID);
    loader?.remove();
  }

  hideOverlay() {
    document.body.classList.remove('footprint-body-locked');
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      overlay.remove();
    }
  }

  createContainer(): HTMLElement {
    const possibleContainer = document.getElementById(CONTAINER_ID);
    if (possibleContainer) {
      return possibleContainer;
    }
    const container = document.createElement('div');
    container.setAttribute('id', CONTAINER_ID);
    document.body.appendChild(container);
    return container;
  }
}

export default VanillaUiAdapter;
