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
    Logger.info('Loading footprint from iframe adapter');
    postmate = await new Postmate.Model({
      // Listen for the new events
      [FootprintPrivateEvent.propsReceived]: (props: FootprintProps) => {
        eventEmitter.emit(FootprintPrivateEvent.propsReceived, props);
      },
    });
    start();
  };

  const close = () => {
    Logger.info('Closing footprint from iframe adapter');
    sendEvent(FootprintPublicEvent.closed);
  };

  const cancel = () => {
    Logger.info('Canceling footprint from iframe adapter');
    sendEvent(FootprintPublicEvent.canceled);
  };

  const start = () => {
    Logger.info('Starting footprint from iframe adapter');
    sendEvent(FootprintPrivateEvent.started);
  };

  const complete = ({ validationToken, closeDelay = 0 }: CompletePayload) => {
    Logger.info('Completing footprint from iframe adapter');
    sendEvent(FootprintPublicEvent.completed, validationToken);
    setTimeout(() => {
      Logger.info(
        'Closing footprint after complete timeout from iframe adapter',
      );
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
