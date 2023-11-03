import type { FootprintPrivateEvent } from '@onefootprint/footprint-js';

import type { CompletePayload, FootprintClient } from '../types';

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
    name: FootprintPrivateEvent,
    callback: (data?: unknown) => void,
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
