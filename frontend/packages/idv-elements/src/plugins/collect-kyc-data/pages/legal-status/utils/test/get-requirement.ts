import {
  CollectedKycDataOption,
  CollectKycDataRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';

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
});

export default getRequirement;
