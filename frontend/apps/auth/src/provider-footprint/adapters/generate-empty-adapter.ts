import type { FootprintPublicEvent } from '@onefootprint/footprint-js';
import type { EmptyAdapterReturn } from '../types';

const generateEmptyAdapter = (): EmptyAdapterReturn => {
  return {
    getAdapterKind: () => 'empty',
    getAdapterResponse: () => null,
    getLoadingStatus: () => false,
    load: () => Promise.resolve(),
    on: () => () => undefined,
    send: (_event: `${FootprintPublicEvent}`, _data?: unknown) => undefined,
  };
};

export default generateEmptyAdapter;
