import type { CollectKycDataRequirement, CollectedKycDataOption } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';

type GetRequirementArgs = {
  missingAttributes?: CollectedKycDataOption[];
  populatedAttributes?: CollectedKycDataOption[];
  optionalAttributes?: CollectedKycDataOption[];
};

const getRequirement = ({
  missingAttributes = [],
  populatedAttributes = [],
  optionalAttributes = [],
}: GetRequirementArgs = {}): CollectKycDataRequirement => ({
  kind: OnboardingRequirementKind.collectKycData,
  isMet: false,
  missingAttributes,
  populatedAttributes,
  optionalAttributes,
  recollectAttributes: [],
});

export default getRequirement;
