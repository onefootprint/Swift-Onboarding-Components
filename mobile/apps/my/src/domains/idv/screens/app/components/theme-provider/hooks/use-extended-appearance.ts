import request from '@onefootprint/request';
import { GetD2PResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import AUTH_HEADER from '@/config/constants';

import createTheme from './theme-factory/create-theme';

const getD2PStatus = async (authToken: string) => {
  const response = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const getAppearance = async (authToken: string) => {
  const response = await getD2PStatus(authToken);
  return createTheme(response.meta.styleParams ?? '');
};

const useExtendedAppearance = (authToken: string) => {
  return useQuery(['appearance', authToken], () => getAppearance(authToken));
};

export default useExtendedAppearance;
