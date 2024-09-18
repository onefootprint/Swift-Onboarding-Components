import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import type { FootprintPublicEvent } from '@onefootprint/footprint-js';
import type { CustomChildAPI } from '@onefootprint/idv';
import { getLogger } from '@onefootprint/idv';
import Postmate from '@onefootprint/postmate';

import type { IframeAdapterReturn } from '../types';
import generateEventEmitter from '../utils';

const { started } = FootprintPrivateEvent;
const { logError, logTrack, logWarn } = getLogger({ location: 'auth-iframe' });

const generateIframeAdapter = (): IframeAdapterReturn => {
  let isAdapterLoaded: boolean = false;
  let postmateChildApiRef: CustomChildAPI | null = null;
  const eventEmitter = generateEventEmitter();

  return {
    getAdapterKind: () => 'iframe',
    getAdapterResponse: () => postmateChildApiRef,
    getLoadingStatus: () => isAdapterLoaded,
    on: eventEmitter.on,
    load: async (): Promise<CustomChildAPI | null> => {
      if (isAdapterLoaded) {
        return Promise.resolve(postmateChildApiRef);
      }

      const crossContextModel = {};

      try {
        postmateChildApiRef = await new Postmate.Model(crossContextModel);
        postmateChildApiRef.emit(started);
        isAdapterLoaded = true;
        logTrack(`The ${started} event has been dispatched`, crossContextModel);

        return postmateChildApiRef;
      } catch (err) {
        isAdapterLoaded = true;
        logError('Footprint.js handshake reply failed', err);

        return null;
      }
    },
    send: (name: `${FootprintPublicEvent}`, data?: unknown): void => {
      if (postmateChildApiRef) {
        postmateChildApiRef.emit(name, data);
        logTrack(`The ${name} event has been dispatched`);
      } else {
        logWarn(`Footprint.js must be initialized in order to dispatch the event "${name}"`);
      }
    },
  };
};

export default generateIframeAdapter;
