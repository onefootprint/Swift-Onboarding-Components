import { useQueryClient } from '@tanstack/react-query';
import { ApiKey } from 'types';

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
