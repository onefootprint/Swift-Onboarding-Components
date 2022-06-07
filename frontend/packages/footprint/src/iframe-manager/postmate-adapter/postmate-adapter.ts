import Postmate from 'postmate';

import { Event, IframeManager } from '../types';

class PostmateAdapter implements IframeManager {
  child: Postmate.ParentAPI | null = null;

  constructor(private iframeUrl: string) {}

  async render(container: HTMLElement) {
    const child = await new Postmate({
      container,
      url: this.iframeUrl,
      name: 'footprint-iframe',
      classListArray: ['footprint-modal'],
    });
    this.child = child;
  }

  resize(width: number, height: number) {
    if (this.child) {
      this.child.frame.style.width = `${width}px`;
      this.child.frame.style.height = `${height}px`;
      this.child.frame.style.left = `calc(50% - ${height / 2}px)`;
    }
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
