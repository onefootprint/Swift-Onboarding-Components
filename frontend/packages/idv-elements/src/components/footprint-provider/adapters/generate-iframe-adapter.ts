import type { FootprintProps } from '@onefootprint/footprint-js';
import {
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';

import Logger from '../../../utils/logger';
import type { CompletePayload, FootprintClientGenerator } from '../types';
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
    sendEvent(FootprintPrivateEvent.started);
  };

  const complete = ({ validationToken, closeDelay = 0 }: CompletePayload) => {
    sendEvent(FootprintPublicEvent.completed, validationToken);
    setTimeout(() => {
      close();
    }, closeDelay);
  };

  const on = (name: string, callback: (data?: unknown) => void) =>
    eventEmitter.on(name, callback);

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
