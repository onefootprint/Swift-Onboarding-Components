import getMissingRequirements from './get-missing-requirements';
import type { IdentifyVerifyRequest } from './identity-verify';
import identifyVerify from './identity-verify';
import startOnboarding from './start-onboarding';

const identifyAndStart = async (payload: IdentifyVerifyRequest) => {
  const { authToken } = await identifyVerify(payload);
  await startOnboarding({ authToken });
  const missingRequirements = await getMissingRequirements({ authToken });
  return { missingRequirements, authToken };
};

export default identifyAndStart;
