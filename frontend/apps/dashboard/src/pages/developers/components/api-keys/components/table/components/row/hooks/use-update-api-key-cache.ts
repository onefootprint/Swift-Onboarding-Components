import { useQueryClient } from '@tanstack/react-query';
import type { ApiKey } from 'src/types/api-key';

const useUpdateApiKeyCache = () => {
  const queryClient = useQueryClient();

  return (apiKey: ApiKey) => {
    queryClient.setQueryData(['api-keys'], (prevApiKeys?: ApiKey[]) => {
      if (prevApiKeys) {
        return prevApiKeys.map(prevApiKey =>
          prevApiKey.id === apiKey.id ? apiKey : prevApiKey,
        );
      }
      return [apiKey];
    });
  };
};

export default useUpdateApiKeyCache;
