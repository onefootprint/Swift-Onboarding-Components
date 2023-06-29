import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { MachineContext } from '../machine/types';

// TODO: (clodoan/belce) edit the util methods in this file at the end to compose the new id doc cdos

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
    CollectedKybDataOption.tin,
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
  if (kybCollect?.[CollectedKybDataOption.kycedBeneficialOwners]) {
    // Remove the beneficialOwners entry, add the kycedBeneficialOwners one
    const index = mustCollectKybData.indexOf(
      CollectedKybDataOption.beneficialOwners,
    );
    if (index > -1) {
      mustCollectKybData.splice(index, 1);
    }
    mustCollectKybData.push(CollectedKybDataOption.kycedBeneficialOwners);
  }

  // Optional BO KYC attributes
  if (kycCollect?.ssnKind === CollectedKycDataOption.ssn4) {
    mustCollectKycData.push(CollectedKycDataOption.ssn4);
  } else if (kycCollect?.ssnKind === CollectedKycDataOption.ssn9) {
    mustCollectKycData.push(CollectedKycDataOption.ssn9);
  }
  if (kycCollect?.[CollectedKycDataOption.nationality]) {
    mustCollectKycData.push(CollectedKycDataOption.nationality);
  }
  const hasCollectedIdDoc = !!kycCollect && kycCollect?.idDoc.types?.length > 0;
  const hasCollectedSelfie =
    hasCollectedIdDoc && kycCollect?.idDoc.selfieRequired;
  if (hasCollectedSelfie) {
    mustCollectKycData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (hasCollectedIdDoc) {
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
  if (kycAccess?.[CollectedKycDataOption.nationality]) {
    canAccessData.push(CollectedKycDataOption.nationality);
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
  const { kycCollect, kycAccess, kycInvestorProfile } = context;

  const mustCollectData: (
    | CollectedKycDataOption
    | CollectedDocumentDataOption
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
  if (kycCollect?.[CollectedKycDataOption.nationality]) {
    mustCollectData.push(CollectedKycDataOption.nationality);
  }
  const hasCollectedIdDoc = !!kycCollect && kycCollect?.idDoc.types?.length > 0;
  const hasCollectedSelfie =
    hasCollectedIdDoc && kycCollect?.idDoc.selfieRequired;
  if (hasCollectedSelfie) {
    mustCollectData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (hasCollectedIdDoc) {
    mustCollectData.push(CollectedDocumentDataOption.document);
  }

  if (
    kycInvestorProfile?.[CollectedInvestorProfileDataOption.investorProfile]
  ) {
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
  if (kycAccess?.[CollectedKycDataOption.nationality]) {
    canAccessData.push(CollectedKycDataOption.nationality);
  }
  if (kycAccess?.[CollectedDocumentDataOption.documentAndSelfie]) {
    canAccessData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (kycAccess?.[CollectedDocumentDataOption.document]) {
    canAccessData.push(CollectedDocumentDataOption.document);
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
