import { getHostedIdentifySessionRequirements, postHostedIdentifySessionVerify } from '@onefootprint/axios';
import type { IdentifyRequirement } from '@onefootprint/request-types';

type LoadRequirementsResult =
  | { kind: 'handleNextRequirement'; requirement: IdentifyRequirement }
  | { kind: 'done'; authToken: string };

const loadNextRequirement = async (identifyToken: string): Promise<LoadRequirementsResult> => {
  const { data } = await getHostedIdentifySessionRequirements({
    headers: { 'X-Fp-Authorization': identifyToken },
    throwOnError: true,
  });

  const requirement = data.requirements[0];
  if (requirement) {
    return { kind: 'handleNextRequirement', requirement };
  }

  // No remaining requirements, we're done. Get the auth token
  const { data: verifyData } = await postHostedIdentifySessionVerify({
    headers: { 'X-Fp-Authorization': identifyToken },
    throwOnError: true,
  });

  return { kind: 'done', authToken: verifyData.authToken };
};

export default loadNextRequirement;
