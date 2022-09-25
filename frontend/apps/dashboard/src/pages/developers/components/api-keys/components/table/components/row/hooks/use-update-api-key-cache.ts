import { ApiKey } from '@onefootprint/types';
import { useQueryClient } from '@tanstack/react-query';

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
