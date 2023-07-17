import { FootprintComponentsEvent } from '@onefootprint/footprint-components-js';
import Postmate from '@onefootprint/postmate';

import { FootprintClient } from '../types';
import EventEmitter from '../utils/event-emitter/event-emmiter';

class IframeAdapter implements FootprintClient {
  private postmate: Postmate.ChildAPI | null = null;

  private eventEmitter = new EventEmitter();

  async load() {
    const postmate = await new Postmate.Model({
      [FootprintComponentsEvent.propsReceived]: (data?: any) => {
        this.eventEmitter.emit(FootprintComponentsEvent.propsReceived, data);
      },
    });
    this.postmate = postmate;
    this.start();
  }

  send(event: string, data?: any) {
    this.sendEvent(event, data);
  }

  start() {
    this.sendEvent(FootprintComponentsEvent.started);
  }

  on(name: string, callback: (result: unknown) => void) {
    return this.eventEmitter.on(name, callback);
  }

  private sendEvent(eventName: string, data?: any) {
    if (this.postmate) {
      this.postmate.emit(eventName, data);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `Footprint-components.js must be initialized in order to dispatch the event "${eventName}"`,
      );
    }
  }
}

export default IframeAdapter;
