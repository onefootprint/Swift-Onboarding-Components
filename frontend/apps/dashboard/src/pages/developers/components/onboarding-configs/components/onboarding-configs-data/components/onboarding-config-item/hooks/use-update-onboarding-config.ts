import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestErrorToast } from 'hooks';
import request, { RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import type { OnboardingConfig } from 'src/types/onboarding-config';

export type UpdateOnboardingConfigRequest = Partial<OnboardingConfig> & {
  id: string;
};

export type UpdateOnboardingConfigResponse = OnboardingConfig;

const updateOnboardingConfig = async (
  authHeaders: AuthHeaders,
  onboardingConfig: UpdateOnboardingConfigRequest,
) => {
  const response = await request<UpdateOnboardingConfigResponse>({
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

const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  const { authHeaders } = useSessionUser();
  const showErrorToast = useRequestErrorToast();

  return useMutation<
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
          queryClient.getQueryData(['onboarding-configs']);

        queryClient.setQueryData(['onboarding-configs'], () =>
          prevOnboardingConfigs?.map(onboardingConfig => {
            if (onboardingConfig.id === updatedOnboardingConfig.id) {
              return { ...onboardingConfig, ...updatedOnboardingConfig };
            }
            return onboardingConfig;
          }),
        );

        return { prevOnboardingConfigs };
      },
      onError: (err, updatedOnboardingConfig, context: any) => {
        showErrorToast(err);

        if (context.prevOnboardingConfigs) {
          queryClient.setQueryData(
            ['onboarding-configs', authHeaders],
            context.prevOnboardingConfigs,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['onboarding-configs']);
      },
    },
  );
};

export default useUpdateStatus;
