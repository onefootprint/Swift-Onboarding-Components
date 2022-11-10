import {
  CompletePayload,
  FootprintClient,
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

  return {
    close,
    complete,
    cancel,
  };
};

export default useFootprintProvider;
