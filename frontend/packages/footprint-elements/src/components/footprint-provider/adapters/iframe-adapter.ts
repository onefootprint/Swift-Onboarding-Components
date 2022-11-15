import { FootprintEvents } from '@onefootprint/footprint-core';
import Postmate from 'postmate';

import {
  CompletePayload,
  FootprintClient,
} from '../footprint-js-provider.types';

class IframeAdapter implements FootprintClient {
  postmate: Postmate.ChildAPI | null = null;

  constructor() {
    this.init();
  }

  sendEvent = (eventName: string, data?: any) => {
    if (this.postmate) {
      this.postmate.emit(eventName, data);
    } else {
      console.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
      );
    }
  };

  async init() {
    const postmate = await new Postmate.Model({});
    this.postmate = postmate;
  }

  close() {
    this.sendEvent(FootprintEvents.closed);
  }

  cancel() {
    this.sendEvent(FootprintEvents.canceled);
  }

  complete({ validationToken, closeDelay = 0 }: CompletePayload) {
    this.sendEvent(FootprintEvents.completed, validationToken);
    setTimeout(() => {
      this.close();
    }, closeDelay);
  }
}

export default IframeAdapter;
