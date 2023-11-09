import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';

import type { FootprintClientGenerator } from '../types';
import generateEventEmitter from '../utils/generate-event-emitter';

const generateIframeAdapter: FootprintClientGenerator = () => {
  let postmate: Postmate.ChildAPI | null = null;
  const eventEmitter = generateEventEmitter();

  const load = async () => {
    postmate = await new Postmate.Model({
      [FootprintPrivateEvent.propsReceived]: (data?: unknown) => {
        eventEmitter.emit(FootprintPrivateEvent.propsReceived, data);
      },
      [FootprintPrivateEvent.formSaved]: () => {
        eventEmitter.emit(FootprintPrivateEvent.formSaved);
      },
    });
    start();
  };

  const send = (event: string, data?: unknown) => {
    sendEventToParent(event, data);
  };

  const start = () => {
    sendEventToParent(FootprintPrivateEvent.started);
  };

  const on = (name: string, callback: (data?: unknown) => void) =>
    eventEmitter.on(name, callback);

  const sendEventToParent = (eventName: string, data?: unknown) => {
    if (postmate) {
      postmate.emit(eventName, data);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `Footprint.js must be initialized in order to dispatch the event "${eventName}"`,
      );
    }
  };

  return {
    load,
    send,
    on,
  };
};

export default generateIframeAdapter;
