import {
  CollectedKycDataOption,
  CollectKycDataRequirement,
} from '@onefootprint/types';

const getSsnKind = (requirement: CollectKycDataRequirement) => {
  const { missingAttributes, optionalAttributes } = requirement;
  let ssnKind: 'ssn4' | 'ssn9' | undefined;

  if (
    missingAttributes.includes(CollectedKycDataOption.ssn9) ||
    optionalAttributes.includes(CollectedKycDataOption.ssn9)
  ) {
    ssnKind = 'ssn9';
  } else if (
    missingAttributes.includes(CollectedKycDataOption.ssn4) ||
    optionalAttributes.includes(CollectedKycDataOption.ssn4)
  ) {
    ssnKind = 'ssn4';
  }

  return ssnKind;
};

export default getSsnKind;
