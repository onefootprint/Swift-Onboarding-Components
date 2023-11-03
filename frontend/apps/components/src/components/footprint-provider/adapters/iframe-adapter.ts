import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';

import type { FootprintClient } from '../types';
import EventEmitter from '../utils/event-emitter/event-emmiter';

class IframeAdapter implements FootprintClient {
  private postmate: Postmate.ChildAPI | null = null;

  private eventEmitter = new EventEmitter();

  async load() {
    const postmate = await new Postmate.Model({
      [FootprintPrivateEvent.propsReceived]: (data?: unknown) => {
        this.eventEmitter.emit(FootprintPrivateEvent.propsReceived, data);
      },
      [FootprintPrivateEvent.formSaved]: () => {
        this.eventEmitter.emit(FootprintPrivateEvent.formSaved);
      },
    });
    this.postmate = postmate;
    this.start();
  }

  send(event: string, data?: unknown) {
    this.sendEventToParent(event, data);
  }

  start() {
    this.sendEventToParent(FootprintPrivateEvent.started);
  }

  on(name: string, callback: (data?: unknown) => void) {
    return this.eventEmitter.on(name, callback);
  }

  private sendEventToParent(eventName: string, data?: unknown) {
    if (this.postmate) {
      this.postmate.emit(eventName, data);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
      );
    }
  }
}

export default IframeAdapter;
