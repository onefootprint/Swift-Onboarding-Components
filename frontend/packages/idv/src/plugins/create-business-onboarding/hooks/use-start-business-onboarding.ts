import type { BootstrapBusinessData, BootstrapUserData } from '@/idv/types';
import { postHostedBusinessOnboarding } from '@onefootprint/axios';
import type { PostHostedBusinessOnboardingData } from '@onefootprint/request-types';
import { useMutation } from '@tanstack/react-query';
import vaultBootstrapData from '../utils/vault-bootstrap-data';

type BootstrapData = {
  bootstrapUserData: BootstrapUserData;
  bootstrapBusinessData: BootstrapBusinessData;
};

const startOnboardingAndVaultBootstrap = async (
  authToken: string,
  onboardingData: PostHostedBusinessOnboardingData,
  bootstrapData: BootstrapData,
) => {
  const { data } = await postHostedBusinessOnboarding({
    ...onboardingData,
    headers: { 'X-Fp-Authorization': authToken },
    throwOnError: true,
  });
  if (data?.isNewBusiness) {
    // We only need to save the bootstrap data if the business is new
    await vaultBootstrapData(bootstrapData, { authToken });
  }
};

const useStartBusinessOnboarding = (
  authToken: string,
  bootstrapData: BootstrapData,
  onError: (error: unknown) => void,
  onDone: () => void,
) => {
  return useMutation({
    mutationFn: (onboardingData: PostHostedBusinessOnboardingData) => {
      return startOnboardingAndVaultBootstrap(authToken, onboardingData, bootstrapData);
    },
    onError,
    onSuccess: onDone,
  });
};

export default useStartBusinessOnboarding;
