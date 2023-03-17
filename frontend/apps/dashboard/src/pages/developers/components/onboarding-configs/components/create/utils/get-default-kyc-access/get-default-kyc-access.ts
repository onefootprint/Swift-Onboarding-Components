import {
  CollectedDocumentDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { MachineContext } from '../machine/types';

const getDefaultKycAccess = (
  kycCollect: MachineContext['kycCollect'],
  kycAccess: MachineContext['kycAccess'],
) => {
  const defaultValues: Partial<
    Record<CollectedKycDataOption | CollectedDocumentDataOption, boolean>
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
    [CollectedDocumentDataOption.document]:
      !!kycCollect?.[CollectedDocumentDataOption.document],
    [CollectedDocumentDataOption.documentAndSelfie]:
      !!kycCollect?.[CollectedDocumentDataOption.documentAndSelfie],
  };

  if (kycAccess) {
    Object.entries(kycAccess).forEach(entry => {
      const key = entry[0] as
        | CollectedKycDataOption
        | CollectedDocumentDataOption;
      const value = entry[1] as boolean;
      defaultValues[key] = value;
    });
  }

  return defaultValues;
};

export default getDefaultKycAccess;
