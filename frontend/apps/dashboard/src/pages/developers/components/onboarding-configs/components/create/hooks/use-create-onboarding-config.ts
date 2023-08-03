import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import {
  OrgOnboardingConfigCreateRequest,
  OrgOnboardingConfigCreateResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const createOnboardingConfig = async (
  authHeaders: AuthHeaders,
  data: OrgOnboardingConfigCreateRequest,
) => {
  const response = await request<OrgOnboardingConfigCreateResponse>({
    data,
    headers: authHeaders,
    method: 'POST',
    url: '/org/onboarding_configs',
  });
  return response.data;
};

const useCreateOnboardingConfig = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(
    (data: OrgOnboardingConfigCreateRequest) =>
      createOnboardingConfig(authHeaders, data),
    {
      onSettled: () => {
        queryClient.invalidateQueries();
      },
      onError: showErrorToast,
    },
  );
};

export default useCreateOnboardingConfig;
