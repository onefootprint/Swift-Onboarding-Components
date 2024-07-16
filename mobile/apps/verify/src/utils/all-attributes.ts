import type { CollectKycDataRequirement } from '@onefootprint/types';

/// Return the list of CDOs that need to be collected to satisfy this requirement, whether already
/// collected or not.
/// This _may_ differ from the ob config's mustCollectData in rare cases
const allAttributes = (req?: CollectKycDataRequirement) =>
  req ? [...req.missingAttributes, ...req.populatedAttributes, ...req.optionalAttributes] : [];

export default allAttributes;
