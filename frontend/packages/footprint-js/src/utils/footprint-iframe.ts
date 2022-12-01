import Postmate from 'postmate';

import {
  FootprintInternalEvent,
  FootprintPublicEvent,
  UserData,
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

  private bootstrap(userData?: UserData) {
    if (userData) {
      this.child?.call(FootprintInternalEvent.bootstrapDataReceived, userData);
    }
  }

  private handleIframeLoaded = () => {
    removeLoader();
  };

  async open(url: string, userData?: UserData) {
    const container = createContainer();
    showOverlay(container);
    this.child = await new Postmate({
      classListArray: ['footprint-modal'],
      container,
      name: 'footprint-iframe',
      url,
    });
    this.handleIframeLoaded();
    this.child.frame.setAttribute(
      'allow',
      'otp-credentials; publickey-credentials-get *; camera *;',
    );

    this.child.on(FootprintPublicEvent.closed, () => this.close());
    this.child.on(FootprintInternalEvent.ready, () => {
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
