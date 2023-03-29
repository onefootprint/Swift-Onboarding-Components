import {
  CollectedIdDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { MachineContext } from '../machine/types';

const getDefaultKycAccess = (
  kycCollect: MachineContext['kycCollect'],
  kycAccess: MachineContext['kycAccess'],
) => {
  const defaultValues: Partial<
    Record<
      | CollectedKycDataOption
      | CollectedIdDocumentDataOption
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
    [CollectedIdDocumentDataOption.document]:
      !!kycCollect?.[CollectedIdDocumentDataOption.document],
    [CollectedIdDocumentDataOption.documentAndSelfie]:
      !!kycCollect?.[CollectedIdDocumentDataOption.documentAndSelfie],
    [CollectedInvestorProfileDataOption.investorProfile]:
      !!kycCollect?.[CollectedInvestorProfileDataOption.investorProfile],
  };

  if (kycAccess) {
    Object.entries(kycAccess).forEach(entry => {
      const key = entry[0] as
        | CollectedKycDataOption
        | CollectedIdDocumentDataOption;
      const value = entry[1] as boolean;
      defaultValues[key] = value;
    });
  }

  return defaultValues;
};

export default getDefaultKycAccess;
