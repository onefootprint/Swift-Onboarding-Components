import { useMutation, useQueryClient } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import type { OnboardingConfig } from 'src/types/onboarding-config';

export type UpdateOnboardingConfigRequest = OnboardingConfig;

export type UpdateOnboardingConfigResponse = OnboardingConfig;

const updateOnboardingConfig = async (
  authHeaders: AuthHeaders,
  onboardingConfig: UpdateOnboardingConfigRequest,
) => {
  const { data: response } = await request<
    RequestResponse<UpdateOnboardingConfigResponse>
  >({
    headers: authHeaders,
    method: 'PATCH',
    url: `/org/onboarding_configs/${onboardingConfig.id}`,
    data: {
      status: onboardingConfig.status,
      name: onboardingConfig.name,
    },
  });
  return response.data;
};

const useUpdateStatus = (onboardingConfig: OnboardingConfig) => {
  const queryClient = useQueryClient();
  const { authHeaders } = useSessionUser();

  const mutation = useMutation<
    UpdateOnboardingConfigResponse,
    RequestError,
    UpdateOnboardingConfigRequest
  >(
    (data: UpdateOnboardingConfigRequest) =>
      updateOnboardingConfig(authHeaders, data),
    {
      onMutate: async updatedOnboardingConfig => {
        await queryClient.cancelQueries(['onboarding-configs']);

        const prevOnboardingConfigs: OnboardingConfig[] | undefined =
          queryClient.getQueryData(['onboarding-configs', authHeaders]);

        queryClient.setQueryData(['onboarding-configs', authHeaders], () =>
          prevOnboardingConfigs?.map(_onboardingConfig => {
            if (_onboardingConfig.id === updatedOnboardingConfig.id) {
              return updatedOnboardingConfig;
            }
            return _onboardingConfig;
          }),
        );

        return { prevOnboardingConfigs };
      },
      onError: (err, updatedOnboardingConfig, context: any) => {
        if (context.prevOnboardingConfigs) {
          queryClient.setQueryData(
            ['onboarding-configs', authHeaders],
            context.prevOnboardingConfigs,
          );
        }
      },
    },
  );

  const toggleStatus = () => {
    if (onboardingConfig.status === 'enabled') {
      mutation.mutate({ ...onboardingConfig, status: 'disabled' });
    } else {
      mutation.mutate({ ...onboardingConfig, status: 'enabled' });
    }
  };

  return {
    toggleStatus,
    mutation,
  };
};

export default useUpdateStatus;
