import Postmate from '@onefootprint/postmate';

import {
  FootprintInternalEvent,
  FootprintPublicEvent,
  FootprintUserData,
} from '../footprint-js.types';
import {
  createContainer,
  createFootprintButton,
  hideOverlay,
  removeLoader,
  showOverlay,
} from './footprint-ui';

class FootprintIframe {
  private child: Postmate.ParentAPI | null = null;

  private bootstrap(userData?: FootprintUserData) {
    if (userData) {
      this.child?.call(FootprintInternalEvent.bootstrapDataReceived, userData);
    }
  }

  private handleIframeLoaded = () => {
    removeLoader();
    this.child?.frame.classList.remove('footprint-modal-loading');
    this.child?.frame.classList.add('footprint-modal-loaded');
  };

  async open(url: string, userData?: FootprintUserData) {
    const container = createContainer();
    showOverlay(container);
    this.child = await new Postmate({
      classListArray: ['footprint-modal', 'footprint-modal-loading'],
      container,
      name: 'footprint-iframe',
      url,
      allow: 'otp-credentials; publickey-credentials-get *; camera *;',
    });
    this.handleIframeLoaded();
    this.child.on(FootprintInternalEvent.started, () => {
      this.bootstrap(userData);
    });
  }

  on(eventName: FootprintPublicEvent, callback: (data?: any) => void) {
    if (!this.child) {
      throw new Error('Footprint should be open in order to listen events');
    }
    return this.child.on(eventName, callback);
  }

  close() {
    hideOverlay();
    if (this.child) {
      this.child.destroy();
    }
  }

  createButton(container: HTMLElement): HTMLButtonElement {
    const button = createFootprintButton();
    container.appendChild(button);
    return button;
  }
}

export default FootprintIframe;
