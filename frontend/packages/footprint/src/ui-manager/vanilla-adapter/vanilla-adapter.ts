import { IframeManager, PublicEvent } from '../../iframe-manager';
import { OpenOptions, UIManager } from '../types';
import createCSSClasses from './vanilla-adapter.utils';

const containerId = 'footprint-container';
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
    this.showOverlay();
    await this.iframeManager.render(container);
    this.iframeManager.on('closed', () => this.close());
    this.iframeManager.on('resized', size => this.resize(size));
  }

  on(eventName: PublicEvent, callback: () => void) {
    this.iframeManager.on(eventName, callback);
  }

  resize(size: { width: number; height: number }) {
    this.iframeManager.resize(size.width, size.height);
  }

  close() {
    this.hideOverlay();
    this.iframeManager.destroy();
  }

  showOverlay() {
    document.body.classList.add('footprint-overlay');
  }

  hideOverlay() {
    document.body.classList.remove('footprint-overlay');
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
