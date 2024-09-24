import {
  CdoToAllDisMap,
  type DataIdentifier,
  type OnboardingRequirement,
  type OnboardingStatusResponse,
} from '@onefootprint/types';
import request from '../utils/request';

const getOnboardingStatus = async (options: { authToken: string }) => {
  const response = await request<OnboardingStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/status',
    headers: {
      'X-Fp-Authorization': options.authToken,
    },
  });

  const fields: Record<'missing' | 'optional' | 'collected', DataIdentifier[]> = {
    missing: [],
    optional: [],
    collected: [],
  };
  const allRequirements = response.allRequirements.map(
    (
      requirement: OnboardingRequirement & {
        optionalAttributes?: string[];
        populatedAttributes?: string[];
        missingAttributes?: string[];
      },
    ) => {
      const optionalAttributes = requirement.optionalAttributes?.flatMap(cdo => CdoToAllDisMap[cdo]) || [];
      const populatedAttributes = requirement.populatedAttributes?.flatMap(cdo => CdoToAllDisMap[cdo]) || [];
      const missingAttributes =
        requirement.missingAttributes
          ?.flatMap(cdo => CdoToAllDisMap[cdo])
          .filter(attr => {
            if (attr === 'id.address_line2' || attr === 'id.middle_name') {
              optionalAttributes.push(attr);
            }
            return attr !== 'id.address_line2' && attr !== 'id.middle_name';
          }) || [];

      fields.optional.push(...optionalAttributes);
      fields.collected.push(...populatedAttributes);
      fields.missing.push(...missingAttributes);

      return requirement;
    },
  );

  const missingRequirements = allRequirements.filter(requirement => !requirement.isMet);
  const isCompleted = missingRequirements.length === 0;

  return {
    requirements: {
      all: allRequirements,
      isCompleted,
      isMissing: !isCompleted,
      missing: missingRequirements,
    },
    fields,
  };
};

export default getOnboardingStatus;
