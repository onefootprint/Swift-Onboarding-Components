import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  IdDocRegionality,
  OrgOnboardingConfigCreateRequest,
} from '@onefootprint/types';

import {
  IdDocData,
  KybCollectData,
  KycCollectData,
  MachineContext,
} from '../machine/types';

const getMustCollectDocumentCdo = (idDocData: IdDocData) => {
  const { selfieRequired, types, regionality } = idDocData;
  const selfie = selfieRequired ? 'require_selfie' : 'none';
  const country = regionality === IdDocRegionality.usOnly ? 'us_only' : 'none';
  const typeString = types.length === 3 ? 'none' : types.join(',');
  return `document.${typeString}.${country}.${selfie}`;
};

export const getRequiredKycCollectFields = () => [
  CollectedKycDataOption.email,
  CollectedKycDataOption.phoneNumber,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.fullAddress,
];

export const getConditionallyRequiredKycFields = (
  kycCollect?: KycCollectData,
) => {
  const mustCollectData: (CollectedKycDataOption | string)[] = [];
  if (kycCollect?.requireSSN && !kycCollect?.optionalSSN) {
    if (kycCollect?.ssnKind === CollectedKycDataOption.ssn4) {
      mustCollectData.push(CollectedKycDataOption.ssn4);
    } else if (kycCollect?.ssnKind === CollectedKycDataOption.ssn9) {
      mustCollectData.push(CollectedKycDataOption.ssn9);
    }
  }
  if (kycCollect?.[CollectedKycDataOption.nationality]) {
    mustCollectData.push(CollectedKycDataOption.nationality);
  }
  const hasCollectedIdDoc = !!kycCollect && kycCollect?.idDoc.types?.length > 0;
  if (hasCollectedIdDoc) {
    const documentDetails = getMustCollectDocumentCdo(kycCollect.idDoc);
    mustCollectData.push(documentDetails);
  }

  return mustCollectData;
};

export const getOptionalKycCollectFields = (kycCollect?: KycCollectData) => {
  const optionalData: (CollectedKycDataOption | string)[] = [];
  if (kycCollect?.optionalSSN) {
    if (kycCollect?.ssnKind === CollectedKycDataOption.ssn4) {
      optionalData.push(CollectedKycDataOption.ssn4);
    } else if (kycCollect?.ssnKind === CollectedKycDataOption.ssn9) {
      optionalData.push(CollectedKycDataOption.ssn9);
    }
  }
  return optionalData;
};

export const getRequiredKybCollectFields = () => [
  CollectedKybDataOption.name,
  CollectedKybDataOption.address,
  CollectedKybDataOption.tin,
  CollectedKybDataOption.beneficialOwners,
];

export const getOptionalKybCollectFields = (kybCollect?: KybCollectData) => {
  const mustCollectKybData: CollectedKybDataOption[] = [];
  if (kybCollect?.[CollectedKybDataOption.website]) {
    mustCollectKybData.push(CollectedKybDataOption.website);
  }
  if (kybCollect?.[CollectedKybDataOption.phoneNumber]) {
    mustCollectKybData.push(CollectedKybDataOption.phoneNumber);
  }
  if (kybCollect?.[CollectedKybDataOption.kycedBeneficialOwners]) {
    mustCollectKybData.push(CollectedKybDataOption.kycedBeneficialOwners);
  }

  return mustCollectKybData;
};

const getKycAccessFields = (
  context: MachineContext,
): (CollectedKycDataOption | string)[] => {
  const { kycCollect, kycAccess } = context;
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

  const hasCollectedIdDoc = !!kycCollect && kycCollect?.idDoc.types?.length > 0;
  const canAccessIdDoc =
    hasCollectedIdDoc && kycAccess?.[CollectedDocumentDataOption.document];
  if (canAccessIdDoc) {
    canAccessData.push(getMustCollectDocumentCdo(kycCollect.idDoc));
  }

  return canAccessData;
};

const getKycOnboardingConfigFromContext = (context: MachineContext) => {
  const { kycCollect, kycAccess, kycInvestorProfile } = context;

  const optionalData = getOptionalKycCollectFields(kycCollect);
  const mustCollectData = [
    ...getRequiredKycCollectFields(),
    ...getConditionallyRequiredKycFields(kycCollect),
  ];
  if (
    kycInvestorProfile?.[CollectedInvestorProfileDataOption.investorProfile]
  ) {
    mustCollectData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  const canAccessData = getKycAccessFields(context);
  if (kycAccess?.[CollectedInvestorProfileDataOption.investorProfile]) {
    canAccessData.push(CollectedInvestorProfileDataOption.investorProfile);
  }
  return { mustCollectData, canAccessData, optionalData };
};

const getKybOnboardingConfigFromContext = (context: MachineContext) => {
  const { kycCollect, kybCollect, kybAccess } = context;
  const optionalData = getOptionalKycCollectFields(kycCollect);

  const mustCollectKybData = [
    ...getRequiredKybCollectFields(),
    ...getOptionalKybCollectFields(kybCollect),
  ];

  if (
    mustCollectKybData.includes(CollectedKybDataOption.kycedBeneficialOwners) &&
    mustCollectKybData.includes(CollectedKybDataOption.beneficialOwners)
  ) {
    // Remove the beneficialOwners entry, add the kycedBeneficialOwners one
    const index = mustCollectKybData.indexOf(
      CollectedKybDataOption.beneficialOwners,
    );
    if (index > -1) {
      mustCollectKybData.splice(index, 1);
    }
  }

  const mustCollectData = [
    ...mustCollectKybData,
    ...getRequiredKycCollectFields(),
    ...getConditionallyRequiredKycFields(kycCollect),
  ];

  const canAccessData: CollectedDataOption[] = kybAccess?.allKybData
    ? [...mustCollectKybData]
    : [];
  canAccessData.push(...getKycAccessFields(context));

  return { mustCollectData, canAccessData, optionalData };
};

const getOnboardingConfigFromContext = (
  context: MachineContext,
): Pick<
  OrgOnboardingConfigCreateRequest,
  'mustCollectData' | 'canAccessData' | 'optionalData'
> => {
  const { type } = context;
  if (type === 'kyb') {
    return getKybOnboardingConfigFromContext(context);
  }
  if (type === 'kyc') {
    return getKycOnboardingConfigFromContext(context);
  }
  return { mustCollectData: [], canAccessData: [], optionalData: [] };
};

export default getOnboardingConfigFromContext;
