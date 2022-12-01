import {
  CompletePayload,
  FootprintClient,
  FootprintInternalEvent,
} from '../footprint-js-provider.types';

type UseFootprintProvider = {
  client: FootprintClient;
};

const useFootprintProvider = ({ client }: UseFootprintProvider) => {
  const close = () => {
    client.close();
  };

  const complete = (payload: CompletePayload) => {
    client.complete(payload);
  };

  const cancel = () => {
    client.cancel();
  };

  const on = (name: FootprintInternalEvent, callback: (data?: any) => void) => {
    client.on(name, callback);
  };

  const ready = () => {
    client.ready();
  };

  return {
    ready,
    close,
    complete,
    cancel,
    on,
  };
};

export default useFootprintProvider;
