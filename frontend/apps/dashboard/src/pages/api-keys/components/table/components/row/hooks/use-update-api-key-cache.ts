import type { ApiKey } from '@onefootprint/types';
import { useQueryClient } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const useUpdateApiKeyCache = () => {
  const queryClient = useQueryClient();
  const { authHeaders } = useSession();

  return (apiKey: ApiKey) => {
    queryClient.setQueriesData(
      {
        queryKey: ['api-keys', authHeaders],
      },
      (prevApiKeys?: ApiKey[]) => {
        if (prevApiKeys) {
          return prevApiKeys.map(prevApiKey => (prevApiKey.id === apiKey.id ? apiKey : prevApiKey));
        }
        return [apiKey];
      },
      {},
    );
  };
};

export default useUpdateApiKeyCache;
