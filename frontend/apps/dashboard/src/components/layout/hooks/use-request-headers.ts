import { client } from '@onefootprint/axios/dashboard';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import useSession from 'src/hooks/use-session';

const useRequestHeaders = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    client.setConfig({ headers: authHeaders });
    queryClient.resetQueries();
  }, [authHeaders]);
};

export default useRequestHeaders;
