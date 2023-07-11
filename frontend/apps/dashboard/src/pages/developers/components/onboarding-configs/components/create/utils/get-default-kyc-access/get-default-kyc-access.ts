import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { MachineContext } from '../machine/types';

const getDefaultKycAccess = (context: MachineContext) => {
  const { kycCollect, kycInvestorProfile, kycAccess } = context;

  const defaultValues: Partial<
    Record<
      | CollectedKycDataOption
      | CollectedDocumentDataOption
      | CollectedInvestorProfileDataOption,
      boolean
    >
  > = {
    [CollectedKycDataOption.email]: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.name]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.fullAddress]: true,
    [CollectedKycDataOption.ssn4]:
      kycCollect?.ssnKind === CollectedKycDataOption.ssn4,
    [CollectedKycDataOption.ssn9]:
      kycCollect?.ssnKind === CollectedKycDataOption.ssn9,
    [CollectedKycDataOption.nationality]:
      !!kycCollect?.[CollectedKycDataOption.nationality],
    [CollectedDocumentDataOption.document]:
      !!kycCollect && kycCollect?.idDoc.types.length > 0,
    [CollectedDocumentDataOption.documentAndSelfie]:
      !!kycCollect &&
      kycCollect?.idDoc.types.length > 0 &&
      kycCollect.idDoc.selfieRequired,
    [CollectedInvestorProfileDataOption.investorProfile]:
      !!kycInvestorProfile?.[
        CollectedInvestorProfileDataOption.investorProfile
      ],
  };

  if (kycAccess) {
    Object.entries(kycAccess).forEach(entry => {
      const key = entry[0] as
        | CollectedKycDataOption
        | CollectedDocumentDataOption
        | CollectedInvestorProfileDataOption;
      const value = entry[1] as boolean;
      defaultValues[key] = value;
    });
  }

  return defaultValues;
};

export default getDefaultKycAccess;
