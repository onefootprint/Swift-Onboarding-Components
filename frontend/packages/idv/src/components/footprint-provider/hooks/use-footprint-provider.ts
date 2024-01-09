import type { ProviderReturn } from '../types';

type UseFootprintProvider = { client: ProviderReturn };

const useFootprintProvider = ({ client }: UseFootprintProvider) => ({
  cancel: client.cancel,
  close: client.close,
  complete: client.complete,
  load: client.load,
  on: client.on,
});

export default useFootprintProvider;
