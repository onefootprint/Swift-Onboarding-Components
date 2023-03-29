import {
  CollectedDataOption,
  CollectedIdDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { MachineContext } from '../machine/types';

const getKybOnboardingConfigFromContext = (
  context: MachineContext,
): {
  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
} => {
  const { kycCollect, kycAccess, kybCollect, kybAccess } = context;

  const mustCollectKybData: CollectedKybDataOption[] = [
    CollectedKybDataOption.name,
    CollectedKybDataOption.address,
    CollectedKybDataOption.ein,
    CollectedKybDataOption.beneficialOwners,
  ];
  const mustCollectKycData: (
    | CollectedKycDataOption
    | CollectedIdDocumentDataOption
  )[] = [
    CollectedKycDataOption.email,
    CollectedKycDataOption.name,
    CollectedKycDataOption.fullAddress,
    CollectedKycDataOption.phoneNumber,
    CollectedKycDataOption.dob,
  ];

  // Optional KYB attributes
  if (kybCollect?.[CollectedKybDataOption.website]) {
    mustCollectKybData.push(CollectedKybDataOption.website);
  }
  if (kybCollect?.[CollectedKybDataOption.phoneNumber]) {
    mustCollectKybData.push(CollectedKybDataOption.phoneNumber);
  }

  // Optional BO KYC attributes
  if (kycCollect?.ssnKind === CollectedKycDataOption.ssn4) {
    mustCollectKycData.push(CollectedKycDataOption.ssn4);
  } else if (kycCollect?.ssnKind === CollectedKycDataOption.ssn9) {
    mustCollectKycData.push(CollectedKycDataOption.ssn9);
  }
  if (kycCollect?.[CollectedIdDocumentDataOption.documentAndSelfie]) {
    mustCollectKycData.push(CollectedIdDocumentDataOption.documentAndSelfie);
  } else if (kycCollect?.[CollectedIdDocumentDataOption.document]) {
    mustCollectKycData.push(CollectedIdDocumentDataOption.document);
  }

  const mustCollectData = [...mustCollectKybData, ...mustCollectKycData];

  const canAccessData: CollectedDataOption[] = kybAccess?.allKybData
    ? [...mustCollectKybData]
    : [];

  if (kycAccess?.[CollectedKycDataOption.email]) {
    canAccessData.push(CollectedKycDataOption.email);
  }
  if (kycAccess?.[CollectedKycDataOption.name]) {
    canAccessData.push(CollectedKycDataOption.name);
  }
  if (kycAccess?.[CollectedKycDataOption.fullAddress]) {
    canAccessData.push(CollectedKycDataOption.fullAddress);
  }
  if (kycAccess?.[CollectedKycDataOption.phoneNumber]) {
    canAccessData.push(CollectedKycDataOption.phoneNumber);
  }
  if (kycAccess?.[CollectedKycDataOption.dob]) {
    canAccessData.push(CollectedKycDataOption.dob);
  }
  if (kycAccess?.[CollectedKycDataOption.ssn4]) {
    canAccessData.push(CollectedKycDataOption.ssn4);
  } else if (kycAccess?.[CollectedKycDataOption.ssn9]) {
    canAccessData.push(CollectedKycDataOption.ssn9);
  }
  if (kycAccess?.[CollectedIdDocumentDataOption.documentAndSelfie]) {
    canAccessData.push(CollectedIdDocumentDataOption.documentAndSelfie);
  } else if (kycAccess?.[CollectedIdDocumentDataOption.document]) {
    canAccessData.push(CollectedIdDocumentDataOption.document);
  }

  return { mustCollectData, canAccessData };
};

const getKycOnboardingConfigFromContext = (
  context: MachineContext,
): {
  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
} => {
  const { kycCollect, kycAccess } = context;

  const mustCollectData: (
    | CollectedKycDataOption
    | CollectedIdDocumentDataOption
    | CollectedInvestorProfileDataOption
  )[] = [
    CollectedKycDataOption.email,
    CollectedKycDataOption.name,
    CollectedKycDataOption.fullAddress,
    CollectedKycDataOption.phoneNumber,
    CollectedKycDataOption.dob,
  ];

  if (kycCollect?.ssnKind === CollectedKycDataOption.ssn4) {
    mustCollectData.push(CollectedKycDataOption.ssn4);
  } else if (kycCollect?.ssnKind === CollectedKycDataOption.ssn9) {
    mustCollectData.push(CollectedKycDataOption.ssn9);
  }
  if (kycCollect?.[CollectedIdDocumentDataOption.documentAndSelfie]) {
    mustCollectData.push(CollectedIdDocumentDataOption.documentAndSelfie);
  } else if (kycCollect?.[CollectedIdDocumentDataOption.document]) {
    mustCollectData.push(CollectedIdDocumentDataOption.document);
  }
  if (kycCollect?.[CollectedInvestorProfileDataOption.investorProfile]) {
    mustCollectData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  const canAccessData: CollectedDataOption[] = [];

  if (kycAccess?.[CollectedKycDataOption.email]) {
    canAccessData.push(CollectedKycDataOption.email);
  }
  if (kycAccess?.[CollectedKycDataOption.name]) {
    canAccessData.push(CollectedKycDataOption.name);
  }
  if (kycAccess?.[CollectedKycDataOption.fullAddress]) {
    canAccessData.push(CollectedKycDataOption.fullAddress);
  }
  if (kycAccess?.[CollectedKycDataOption.phoneNumber]) {
    canAccessData.push(CollectedKycDataOption.phoneNumber);
  }
  if (kycAccess?.[CollectedKycDataOption.dob]) {
    canAccessData.push(CollectedKycDataOption.dob);
  }
  if (kycAccess?.[CollectedKycDataOption.ssn4]) {
    canAccessData.push(CollectedKycDataOption.ssn4);
  } else if (kycAccess?.[CollectedKycDataOption.ssn9]) {
    canAccessData.push(CollectedKycDataOption.ssn9);
  }
  if (kycAccess?.[CollectedIdDocumentDataOption.documentAndSelfie]) {
    canAccessData.push(CollectedIdDocumentDataOption.documentAndSelfie);
  } else if (kycAccess?.[CollectedIdDocumentDataOption.document]) {
    canAccessData.push(CollectedIdDocumentDataOption.document);
  }
  if (kycAccess?.[CollectedInvestorProfileDataOption.investorProfile]) {
    canAccessData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  return { mustCollectData, canAccessData };
};

const getOnboardingConfigFromContext = (
  context: MachineContext,
): {
  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
} => {
  const { type } = context;
  if (type === 'kyb') {
    return getKybOnboardingConfigFromContext(context);
  }
  if (type === 'kyc') {
    return getKycOnboardingConfigFromContext(context);
  }
  return { mustCollectData: [], canAccessData: [] };
};

export default getOnboardingConfigFromContext;
