import type { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import type { IdvBootstrapData, IdvOptions } from '@onefootprint/types';

import type {
  CompletePayload,
  FootprintClient,
  LegacyFootprintInternalEvent,
} from '../types';

type UseFootprintProvider = { client: FootprintClient };

const useFootprintProvider = ({ client }: UseFootprintProvider) => {
  const cancel = () => {
    client.cancel();
  };

  const close = () => {
    client.close();
  };

  const complete = (payload: CompletePayload) => {
    client.complete(payload);
  };

  const on = (
    name: LegacyFootprintInternalEvent | FootprintPrivateEvent,
    callback: ((data: IdvBootstrapData) => void) | ((data: IdvOptions) => void),
  ) => client.on(name, callback);

  const load = () => client.load();

  return {
    cancel,
    close,
    complete,
    on,
    load,
  };
};

export default useFootprintProvider;
