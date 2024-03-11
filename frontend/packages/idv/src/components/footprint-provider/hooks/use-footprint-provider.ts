import type { ProviderReturn } from '../types';

type UseFootprintProvider = { client: ProviderReturn };

const useFootprintProvider = ({
  client,
}: UseFootprintProvider): ProviderReturn => ({
  auth: client.auth,
  cancel: client.cancel,
  close: client.close,
  complete: client.complete,
  getAdapterResponse: client.getAdapterResponse,
  getLoadingStatus: client.getLoadingStatus,
  load: client.load,
  on: client.on,
});

export default useFootprintProvider;
