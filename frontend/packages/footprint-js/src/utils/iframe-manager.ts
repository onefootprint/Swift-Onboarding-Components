import Postmate from 'postmate';

import { FootprintEvents } from '../types/footprint.types';
import {
  createContainer,
  createFootprintButton,
  hideOverlay,
  removeLoader,
  showOverlay,
} from './ui-manager';

class IframeManager {
  private child: Postmate.ParentAPI | null = null;

  async show(options: { url: string }) {
    const { url } = options;
    const handleOnIframeLoaded = () => {
      removeLoader();
    };

    const container = createContainer();
    showOverlay(container);
    const child = await new Postmate({
      classListArray: ['footprint-modal'],
      container,
      name: 'footprint-iframe',
      url,
    });
    child.frame.setAttribute(
      'allow',
      'otp-credentials; publickey-credentials-get *; camera *;',
    );
    handleOnIframeLoaded();
    child.on(FootprintEvents.closed, () => this.hide());
    this.child = child;
  }

  on(eventName: FootprintEvents, callback: (data?: any) => void) {
    if (!this.child) {
      throw new Error('Footprint should be open in order to listen events');
    }
    return this.child.on(eventName, callback);
  }

  hide() {
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

export default IframeManager;
