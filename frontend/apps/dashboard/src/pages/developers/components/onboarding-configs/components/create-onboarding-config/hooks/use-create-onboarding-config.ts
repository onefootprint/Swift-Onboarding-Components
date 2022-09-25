import { useRequestErrorToast } from '@onefootprint/hooks';
import {
  OrgOnboardingConfigCreateRequest,
  OrgOnboardingConfigCreateResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

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
  const { authHeaders } = useSessionUser();
  const queryClient = useQueryClient();

  return useMutation<
    OrgOnboardingConfigCreateResponse,
    RequestError,
    OrgOnboardingConfigCreateRequest
  >(
    (data: OrgOnboardingConfigCreateRequest) =>
      createOnboardingConfig(authHeaders, data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(['onboarding-configs']);
      },
      onError: showErrorToast,
    },
  );
};

export default useCreateOnboardingConfig;
