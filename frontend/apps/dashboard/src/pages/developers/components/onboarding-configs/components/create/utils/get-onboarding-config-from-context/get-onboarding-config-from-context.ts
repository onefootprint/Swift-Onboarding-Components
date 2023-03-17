import {
  CollectedDataOption,
  CollectedDocumentDataOption,
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
    | CollectedDocumentDataOption
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
  if (kycCollect?.[CollectedDocumentDataOption.documentAndSelfie]) {
    mustCollectKycData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (kycCollect?.[CollectedDocumentDataOption.document]) {
    mustCollectKycData.push(CollectedDocumentDataOption.document);
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
  if (kycAccess?.[CollectedDocumentDataOption.documentAndSelfie]) {
    canAccessData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (kycAccess?.[CollectedDocumentDataOption.document]) {
    canAccessData.push(CollectedDocumentDataOption.document);
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

  const mustCollectData: CollectedDataOption[] = [
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

  if (kycCollect?.[CollectedDocumentDataOption.documentAndSelfie]) {
    mustCollectData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (kycCollect?.[CollectedDocumentDataOption.document]) {
    mustCollectData.push(CollectedDocumentDataOption.document);
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
  if (kycAccess?.[CollectedDocumentDataOption.documentAndSelfie]) {
    canAccessData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (kycAccess?.[CollectedDocumentDataOption.document]) {
    canAccessData.push(CollectedDocumentDataOption.document);
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
