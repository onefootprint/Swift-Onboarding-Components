import type { FootprintProps } from '@onefootprint/footprint-js';
import {
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';
import type { IdvBootstrapData, IdvOptions } from '@onefootprint/types';

import Logger from '../../../utils/logger';
import type { CompletePayload, FootprintClientGenerator } from '../types';
import { LegacyFootprintInternalEvent } from '../types';
import generateEventEmitter from '../utils/generate-event-emitter';

const generateIframeAdapter: FootprintClientGenerator = () => {
  let postmate: Postmate.ChildAPI | null = null;
  const eventEmitter = generateEventEmitter();

  const load = async () => {
    postmate = await new Postmate.Model({
      // Listen for the new events
      [FootprintPrivateEvent.propsReceived]: (props: FootprintProps) => {
        eventEmitter.emit(FootprintPrivateEvent.propsReceived, props);
      },

      // We still support listening for the legacy events in bifrost but
      // these shouldn't be used for new features since they will get deprecated
      [LegacyFootprintInternalEvent.bootstrapDataReceived]: (
        data?: IdvBootstrapData,
      ) => {
        eventEmitter.emit(
          LegacyFootprintInternalEvent.bootstrapDataReceived,
          data,
        );
      },
      [LegacyFootprintInternalEvent.optionsReceived]: (data?: IdvOptions) => {
        eventEmitter.emit(LegacyFootprintInternalEvent.optionsReceived, data);
      },
    });
    start();
  };

  const close = () => {
    sendEvent(FootprintPublicEvent.closed);
  };

  const cancel = () => {
    sendEvent(FootprintPublicEvent.canceled);
  };

  const start = () => {
    // Send both new and legacy start message to the SDK client (since
    // we don't know which version it is running)
    sendEvent(FootprintPrivateEvent.started);
    sendEvent(LegacyFootprintInternalEvent.started);
  };

  const complete = ({ validationToken, closeDelay = 0 }: CompletePayload) => {
    sendEvent(FootprintPublicEvent.completed, validationToken);
    setTimeout(() => {
      close();
    }, closeDelay);
  };

  const on = (
    name: string,
    callback: ((data: IdvBootstrapData) => void) | ((data: IdvOptions) => void),
  ) => eventEmitter.on(name, callback);

  const sendEvent = (eventName: string, data?: unknown) => {
    if (postmate) {
      postmate.emit(eventName, data);
    } else {
      Logger.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
        'bifrost-iframe-adapter',
      );
    }
  };

  return {
    load,
    cancel,
    close,
    complete,
    on,
  };
};

export default generateIframeAdapter;
