import type { FootprintProps } from '@onefootprint/footprint-js';
import { FootprintPrivateEvent, FootprintPublicEvent } from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';

import { getLogger } from '../../../utils/logger';
import type { CompletePayload, CustomChildAPI, IframeAdapterReturn } from '../types';
import generateEventEmitter from '../utils/generate-event-emitter';

const { auth, canceled, closed, completed, relayToComponents } = FootprintPublicEvent;
const { propsReceived, started, relayFromComponents } = FootprintPrivateEvent;
const { logError, logInfo, logWarn } = getLogger({
  location: 'bifrost-iframe-adapter',
});

const getSpecificEvent = (event: string, childRef: CustomChildAPI | null): string => {
  const sdkInitId = childRef?.model?.initId;
  return sdkInitId?.length ? `${sdkInitId}:${event}` : event;
};

const generateIframeAdapter = (): IframeAdapterReturn => {
  let isAdapterLoaded: boolean = false;
  let postmateChildApiRef: CustomChildAPI | null = null;
  const eventEmitter = generateEventEmitter();

  const sendEvent = (event: string, data?: unknown): void => {
    const specificEvent = getSpecificEvent(event, postmateChildApiRef);
    const eventName = specificEvent.split(':').at(1) || specificEvent;
    if (postmateChildApiRef) {
      postmateChildApiRef.emit(specificEvent, data);
      logInfo(`The ${eventName} event has been dispatched`);
    } else {
      logWarn(`Footprint.js must be initialized in order to dispatch the event "${event}"`);
    }
  };

  const load = async (): Promise<CustomChildAPI | null> => {
    if (isAdapterLoaded) {
      return Promise.resolve(postmateChildApiRef);
    }

    const contextModel = {
      [propsReceived]: (props: FootprintProps) => {
        eventEmitter.emit(propsReceived, props);
      },
      [relayFromComponents]: () => {
        eventEmitter.emit(relayFromComponents);
      },
    };

    try {
      postmateChildApiRef = await new Postmate.Model(contextModel);
      logInfo('Starting footprint from iframe adapter');
      postmateChildApiRef.emit(started);
      isAdapterLoaded = true;

      return postmateChildApiRef;
    } catch (err) {
      isAdapterLoaded = true;
      logError('Footprint.js handshake reply failed', err);

      return null;
    }
  };

  const complete = ({ validationToken, delay = 0 }: CompletePayload) => {
    logInfo('Completing footprint from iframe adapter');
    sendEvent(completed, validationToken);
    setTimeout(() => {
      logInfo('Closing footprint after complete timeout from iframe adapter');
      sendEvent(closed);
    }, delay);
  };

  return {
    auth: (validationToken: string) => sendEvent(auth, validationToken),
    relayToComponents: (tokens: { authToken: string; vaultingToken: string }) => sendEvent(relayToComponents, tokens),
    cancel: () => sendEvent(canceled),
    close: () => sendEvent(closed),
    complete,
    getAdapterResponse: () => postmateChildApiRef,
    getLoadingStatus: () => isAdapterLoaded,
    load,
    on: eventEmitter.on,
  };
};

export default generateIframeAdapter;
