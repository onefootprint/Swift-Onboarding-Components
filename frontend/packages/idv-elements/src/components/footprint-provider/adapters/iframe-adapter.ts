import type { FootprintProps } from '@onefootprint/footprint-js';
import {
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';
import type { IdvBootstrapData, IdvOptions } from '@onefootprint/types';

import type { CompletePayload, FootprintClient } from '../types';
import { LegacyFootprintInternalEvent } from '../types';
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

      // We still support listening for the legacy events in bifrost but
      // these shouldn't be used for new features since they will get deprecated
      [LegacyFootprintInternalEvent.bootstrapDataReceived]: (
        data?: IdvBootstrapData,
      ) => {
        this.eventEmitter.emit(
          LegacyFootprintInternalEvent.bootstrapDataReceived,
          data,
        );
      },
      [LegacyFootprintInternalEvent.optionsReceived]: (data?: IdvOptions) => {
        this.eventEmitter.emit(
          LegacyFootprintInternalEvent.optionsReceived,
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
    // Send both new and legacy start message to the SDK client (since
    // we don't know which version it is running)
    this.sendEvent(FootprintPrivateEvent.started);
    this.sendEvent(LegacyFootprintInternalEvent.started);
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
