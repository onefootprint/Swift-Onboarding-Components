import type { FootprintProps } from '@onefootprint/footprint-js';
import {
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';

import Logger from '../../../utils/logger';
import type { CompletePayload, FootprintClient } from '../types';
import EventEmitter from '../utils/event-emitter/event-emmiter';

class IframeAdapter implements FootprintClient {
  private postmate: Postmate.ChildAPI | null = null;

  private eventEmitter = new EventEmitter();

  async load() {
    const postmate = await new Postmate.Model({
      // Listen for the new events
      [FootprintPrivateEvent.propsReceived]: (props: FootprintProps) => {
        this.eventEmitter.emit(FootprintPrivateEvent.propsReceived, props);
      },
    });
    this.postmate = postmate;
    this.start();
  }

  close() {
    this.sendEvent(FootprintPublicEvent.closed);
  }

  cancel() {
    this.sendEvent(FootprintPublicEvent.canceled);
  }

  start() {
    this.sendEvent(FootprintPrivateEvent.started);
  }

  complete({ validationToken, closeDelay = 0 }: CompletePayload) {
    this.sendEvent(FootprintPublicEvent.completed, validationToken);
    setTimeout(() => {
      this.close();
    }, closeDelay);
  }

  on(name: string, callback: (result: unknown) => void) {
    return this.eventEmitter.on(name, callback);
  }

  private sendEvent(eventName: string, data?: any) {
    if (this.postmate) {
      this.postmate.emit(eventName, data);
    } else {
      Logger.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
        'bifrost-iframe-adapter',
      );
    }
  }
}

export default IframeAdapter;
