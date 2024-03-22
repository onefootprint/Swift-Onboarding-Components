import getOnboardingStatus from './get-onboarding-status';
import type { IdentifyVerifyRequest } from './identity-verify';
import identifyVerify from './identity-verify';
import startOnboarding from './start-onboarding';

const identifyAndStart = async (payload: IdentifyVerifyRequest) => {
  const { authToken } = await identifyVerify(payload);
  await startOnboarding({ authToken });
  const { missingRequirements, onboardingConfig } = await getOnboardingStatus({
    authToken,
  });
  return { missingRequirements, onboardingConfig, authToken };
};

export default identifyAndStart;
