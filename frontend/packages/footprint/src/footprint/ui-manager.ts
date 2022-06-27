import Postmate from 'postmate';

import {
  CONTAINER_ID,
  IS_SSR,
  LOADING_INDICATOR_ID,
  OVERLAY_ID,
} from '../config/constants';
import { Event, Events, OpenOptions, UIManager } from './types';
import {
  createCSSClasses,
  createFootprintButton,
  createLoadingIndicator,
} from './utils/ui-utils';

export default class implements UIManager {
  private child: Postmate.ParentAPI | null = null;

  constructor() {
    if (!IS_SSR) {
      createCSSClasses();
    }
  }

  async show({ url }: OpenOptions) {
    const handleOnIframeLoaded = () => {
      const loader = document.getElementById(LOADING_INDICATOR_ID);
      if (loader) {
        loader.remove();
      }
    };

    const container = this.createContainer();
    this.showOverlay(container);
    const child = await new Postmate({
      classListArray: ['footprint-modal'],
      container,
      name: 'footprint-iframe',
      url,
    });
    child.frame.setAttribute(
      'allow',
      'otp-credentials; publickey-credentials-get *',
    );
    handleOnIframeLoaded();
    child.on(Events.closed, () => this.hide());
    this.child = child;
  }

  on(eventName: Event, callback: (data?: any) => void) {
    if (!this.child) {
      throw new Error('Footprint should be open in order to listen events');
    }
    return this.child.on(eventName, callback);
  }

  hide() {
    this.hideOverlay();
    if (this.child) {
      this.child.destroy();
    }
  }

  createButton(container: HTMLElement): HTMLButtonElement {
    const button = createFootprintButton();
    container.appendChild(button);
    return button;
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
