import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import {
  OnboardingConfig,
  OrgOnboardingConfigUpdateRequest,
  OrgOnboardingConfigUpdateResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const updateOnboardingConfig = async (
  authHeaders: AuthHeaders,
  onboardingConfig: OrgOnboardingConfigUpdateRequest,
) => {
  const response = await request<OrgOnboardingConfigUpdateResponse>({
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
  const { authHeaders } = useSession();
  const showErrorToast = useRequestErrorToast();

  return useMutation(
    (data: OrgOnboardingConfigUpdateRequest) =>
      updateOnboardingConfig(authHeaders, data),
    {
      onMutate: async updatedOnboardingConfig => {
        await queryClient.cancelQueries(['onboarding-configs', authHeaders]);

        const prevOnboardingConfigs: OnboardingConfig[] | undefined =
          queryClient.getQueryData(['onboarding-configs', authHeaders]);

        queryClient.setQueryData(['onboarding-configs', authHeaders], () =>
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
