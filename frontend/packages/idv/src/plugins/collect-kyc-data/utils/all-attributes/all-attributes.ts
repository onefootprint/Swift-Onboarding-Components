import type { CollectKycDataRequirement, CollectedKycDataOption } from '@onefootprint/types';

/// Return the list of CDOs that need to be collected to satisfy this requirement, whether already
/// collected or not.
/// This _may_ differ from the ob config's mustCollectData in rare cases
const getAllKycAttributes = (req: CollectKycDataRequirement): CollectedKycDataOption[] => [
  ...req.missingAttributes,
  ...req.populatedAttributes,
  ...req.optionalAttributes,
];

export default getAllKycAttributes;
