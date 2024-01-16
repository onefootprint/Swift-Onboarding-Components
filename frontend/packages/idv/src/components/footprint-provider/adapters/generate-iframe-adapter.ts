import type { FootprintProps } from '@onefootprint/footprint-js';
import {
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import Postmate from '@onefootprint/postmate';

import Logger from '../../../utils/logger';
import type {
  CompletePayload,
  CustomChildAPI,
  IframeAdapterReturn,
} from '../types';
import generateEventEmitter from '../utils/generate-event-emitter';

const { closed, canceled, completed } = FootprintPublicEvent;
const { propsReceived, started } = FootprintPrivateEvent;

const getSpecificEvent = (
  event: string,
  childRef: CustomChildAPI | null,
): string => {
  const sdkInitId = childRef?.model?.initId;
  return sdkInitId?.length ? `${sdkInitId}:${event}` : event;
};

const generateIframeAdapter = (): IframeAdapterReturn => {
  let isAdapterLoaded: boolean = false;
  let postmateChildApiRef: CustomChildAPI | null = null;
  const eventEmitter = generateEventEmitter();

  const sendEvent = (event: string, data?: unknown): void => {
    const specificEvent = getSpecificEvent(event, postmateChildApiRef);
    if (postmateChildApiRef) {
      postmateChildApiRef.emit(specificEvent, data);
    } else {
      Logger.warn(
        `Footprint.js must be initialized in order to dispatch the event "${event}"`,
        'bifrost-iframe-adapter',
      );
    }
  };

  const close = (): void => {
    Logger.info('Closing footprint from iframe adapter');
    sendEvent(closed);
  };

  const cancel = (): void => {
    Logger.info('Canceling footprint from iframe adapter');
    sendEvent(canceled);
  };

  const load = async (): Promise<CustomChildAPI | null> => {
    if (isAdapterLoaded) {
      return Promise.resolve(postmateChildApiRef);
    }

    Logger.info('Loading footprint from iframe adapter');
    const contextModel = {
      [propsReceived]: (props: FootprintProps) => {
        eventEmitter.emit(propsReceived, props);
      },
    };

    try {
      postmateChildApiRef = await new Postmate.Model(contextModel);
      Logger.info('Starting footprint from iframe adapter');
      postmateChildApiRef.emit(started);
      isAdapterLoaded = true;

      return postmateChildApiRef;
    } catch (err) {
      isAdapterLoaded = true;
      Logger.warn('Footprint.js handshake reply failed');

      return null;
    }
  };

  const complete = ({ validationToken, closeDelay = 0 }: CompletePayload) => {
    Logger.info('Completing footprint from iframe adapter');
    sendEvent(completed, validationToken);
    setTimeout(() => {
      Logger.info(
        'Closing footprint after complete timeout from iframe adapter',
      );
      close();
    }, closeDelay);
  };

  return {
    cancel,
    close,
    complete,
    getAdapterResponse: () => postmateChildApiRef,
    getLoadingStatus: () => isAdapterLoaded,
    load,
    on: eventEmitter.on,
  };
};

export default generateIframeAdapter;
