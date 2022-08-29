import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestErrorToast } from 'hooks';
import request, { RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

export type CreateOnboardingConfigRequest = {
  name: string;
  mustCollectData: string[];
  canAccessData: string[];
};

export type GetOnboardingConfigResponse = string;

const createOnboardingConfig = async (
  authHeaders: AuthHeaders,
  data: CreateOnboardingConfigRequest,
) => {
  const response = await request<GetOnboardingConfigResponse>({
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
    GetOnboardingConfigResponse,
    RequestError,
    CreateOnboardingConfigRequest
  >(
    (data: CreateOnboardingConfigRequest) =>
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
