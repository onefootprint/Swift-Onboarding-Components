import Postmate from 'postmate';

import { Event, IframeManager } from '../types';

const iframeName = 'footprint-iframe';

class PostmateAdapter implements IframeManager {
  child: Postmate.ParentAPI | null = null;

  constructor(private iframeUrl: string) {}

  async render(container: HTMLElement, iframeClassList = []) {
    const child = await new Postmate({
      container,
      url: this.iframeUrl,
      name: iframeName,
      classListArray: iframeClassList,
    });
    const iframe = document.querySelector(`[name=${iframeName}]`);
    iframe?.setAttribute(
      'allow',
      'otp-credentials; publickey-credentials-get *',
    );
    this.child = child;
  }

  destroy() {
    if (this.child) {
      this.child.destroy();
    }
  }

  on(eventName: Event, callback: (data?: any) => void) {
    if (!this.child) {
      throw Error(
        'Postmate must be initialized first by calling the method "render"',
      );
    }
    return this.child.on(eventName, callback);
  }
}

export default PostmateAdapter;
