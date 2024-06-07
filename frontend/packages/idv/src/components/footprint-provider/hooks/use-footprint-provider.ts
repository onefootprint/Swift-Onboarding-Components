import type { ProviderReturn } from '../types';
import useSendResultSdkArgs from './use-send-result-sdk-args';

type UseFootprintProvider = { client: ProviderReturn };

const useFootprintProvider = ({ client }: UseFootprintProvider): ProviderReturn => {
  const sendResultMutation = useSendResultSdkArgs();
  const sendResult = async (authToken: string, deviceResponse: string): Promise<string | undefined> => {
    if (!authToken || !deviceResponse) {
      return undefined;
    }
    try {
      const result = await sendResultMutation.mutateAsync({
        authToken,
        deviceResponse,
      });
      return result;
    } catch {
      return undefined;
    }
  };
  client.setSendResultCallback?.(sendResult);

  return {
    auth: client.auth,
    relayToComponents: client.relayToComponents,
    cancel: client.cancel,
    close: client.close,
    complete: client.complete,
    getAdapterResponse: client.getAdapterResponse,
    getLoadingStatus: client.getLoadingStatus,
    load: client.load,
    on: client.on,
  };
};
export default useFootprintProvider;
