import Postmate from 'postmate';

import { Event, IframeManager, RenderOptions } from '../types';

const iframeName = 'footprint-iframe';

class PostmateIframeAdapter implements IframeManager {
  private child: Postmate.ParentAPI | null = null;

  constructor(private iframeUrl: string) {}

  async render({ container, classList, urlHash }: RenderOptions) {
    const child = await new Postmate({
      classListArray: classList,
      container,
      name: iframeName,
      url: `${this.iframeUrl}#${urlHash}`,
    });
    const iframe = document.querySelector(`[name=${iframeName}]`);
    if (iframe) {
      iframe.setAttribute(
        'allow',
        'otp-credentials; publickey-credentials-get *',
      );
    }
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

export default PostmateIframeAdapter;
