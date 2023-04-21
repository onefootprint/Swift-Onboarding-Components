import {
  CompletePayload,
  FootprintClient,
  FootprintInternalEvent,
} from '../footprint-js-provider.types';

type UseFootprintProvider = {
  client: FootprintClient;
};

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

  const on = (name: FootprintInternalEvent, callback: (data?: any) => void) =>
    client.on(name, callback);

  const load = () => {
    client.load();
  };

  return {
    cancel,
    close,
    complete,
    on,
    load,
  };
};

export default useFootprintProvider;
