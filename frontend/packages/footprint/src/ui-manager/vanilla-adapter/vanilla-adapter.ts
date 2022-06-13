import { IframeManager, PublicEvent } from '../../iframe-manager';
import { OpenOptions, UIManager } from '../types';
import createCSSClasses from './vanilla-adapter.utils';

const containerId = 'footprint-container';
const overlayId = 'footprint-overlay';
const isSSR = typeof window === 'undefined';

class VanillaAdapter implements UIManager {
  constructor(private iframeManager: IframeManager) {
    if (!isSSR) {
      createCSSClasses();
    }
  }

  async show(options?: OpenOptions) {
    // TODO: Implement
    // https://linear.app/footprint/issue/FP-180/fooprintjs-inject-data
    console.log('options', options);
    const container = this.createContainer();
    this.showOverlay(container);
    await this.iframeManager.render(container, ['footprint-modal']);
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
    const overlay = document.createElement('div');
    overlay.setAttribute('id', overlayId);
    overlay.classList.add('footprint-overlay');
    container.appendChild(overlay);
  }

  hideOverlay() {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
      overlay.remove();
    }
  }

  createContainer(): HTMLElement {
    const possibleContainer = document.getElementById(containerId);
    if (possibleContainer) {
      return possibleContainer;
    }
    const container = document.createElement('div');
    container.setAttribute('id', containerId);
    document.body.appendChild(container);
    return container;
  }
}

export default VanillaAdapter;
