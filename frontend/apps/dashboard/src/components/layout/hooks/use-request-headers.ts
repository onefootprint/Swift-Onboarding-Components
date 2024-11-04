import { client } from '@onefootprint/axios/dashboard';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  DASHBOARD_ALLOW_ASSUMED_WRITES,
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from 'src/config/constants';
import useSession from 'src/hooks/use-session';

const useRequestHeaders = () => {
  const {
    data: { auth },
    isLive,
    isAssumedSessionEditMode,
  } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auth) return;
    client.setConfig({
      headers: {
        [DASHBOARD_AUTHORIZATION_HEADER]: auth,
        [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(isLive),
        ...(isAssumedSessionEditMode && {
          [DASHBOARD_ALLOW_ASSUMED_WRITES]: JSON.stringify(true),
        }),
      },
    });
    queryClient.resetQueries();
  }, [auth, isLive, isAssumedSessionEditMode]);
};

export default useRequestHeaders;
