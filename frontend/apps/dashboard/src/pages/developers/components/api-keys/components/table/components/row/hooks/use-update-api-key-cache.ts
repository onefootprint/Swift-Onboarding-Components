import { useQueryClient } from '@tanstack/react-query';
import useSessionUser from 'src/hooks/use-session-user';
import type { ApiKey } from 'src/types/api-key';

const useUpdateApiKeyCache = () => {
  const queryClient = useQueryClient();
  const { authHeaders } = useSessionUser();

  return (apiKey: ApiKey) => {
    queryClient.setQueryData(
      ['api-keys', authHeaders],
      (prevApiKeys?: ApiKey[]) => {
        if (prevApiKeys) {
          return prevApiKeys.map(prevApiKey =>
            prevApiKey.id === apiKey.id ? apiKey : prevApiKey,
          );
        }
        return [apiKey];
      },
    );
  };
};

export default useUpdateApiKeyCache;
