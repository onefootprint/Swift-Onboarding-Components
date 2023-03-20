import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';

import {
  CompletePayload,
  FootprintClient,
  FootprintInternalEvent,
} from '../footprint-js-provider.types';
import EventEmitter from '../utils/event-emitter/event-emmiter';

class IframeAdapter implements FootprintClient {
  private postmate: Postmate.ChildAPI | null = null;

  private eventEmitter = new EventEmitter();

  async load() {
    const postmate = await new Postmate.Model({
      [FootprintInternalEvent.bootstrapDataReceived]: (data?: any) => {
        this.eventEmitter.emit(
          FootprintInternalEvent.bootstrapDataReceived,
          data,
        );
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
    this.sendEvent(FootprintInternalEvent.started);
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
      console.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
      );
    }
  }
}

export default IframeAdapter;
