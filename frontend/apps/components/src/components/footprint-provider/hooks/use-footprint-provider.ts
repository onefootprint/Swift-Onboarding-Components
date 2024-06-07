import type { ProviderReturn } from '../types';

type UseFootprintProvider = {
  client: ProviderReturn;
};

const useFootprintProvider = ({ client }: UseFootprintProvider): ProviderReturn => ({
  getAdapterResponse: client.getAdapterResponse,
  getLoadingStatus: client.getLoadingStatus,
  load: client.load,
  on: client.on,
  send: client.send,
});

export default useFootprintProvider;
