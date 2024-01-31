import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import type { CustomChildAPI } from '@onefootprint/idv';
import Postmate from '@onefootprint/postmate';

import type { IframeAdapterReturn } from '../types';
import generateEventEmitter from '../utils';

const { started } = FootprintPrivateEvent;

const generateIframeAdapter = (): IframeAdapterReturn => {
  let isAdapterLoaded: boolean = false;
  let postmateChildApiRef: CustomChildAPI | null = null;
  const eventEmitter = generateEventEmitter();

  return {
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

        return postmateChildApiRef;
      } catch (err) {
        isAdapterLoaded = true;
        console.error('Footprint.js handshake reply failed', err);

        return null;
      }
    },
    send: (name: string, data?: unknown): void =>
      postmateChildApiRef
        ? postmateChildApiRef.emit(name, data)
        : console.warn(
            `Footprint.js must be initialized in order to dispatch the event "${name}"`,
          ),
  };
};

export default generateIframeAdapter;
