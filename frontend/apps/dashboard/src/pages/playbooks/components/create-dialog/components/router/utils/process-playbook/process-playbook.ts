import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { isAuth, isIdDoc, isKyb, isKyc } from '@/playbooks/utils/kind';
import type {
  BusinessInformation,
  NameFormData,
  PlaybookKind,
  ResidencyFormData,
  SummaryFormData,
} from '@/playbooks/utils/machine/types';
import {
  CountryRestriction,
  OnboardingTemplate,
} from '@/playbooks/utils/machine/types';

type ProcessPlaybookProps = {
  playbook: SummaryFormData;
  kind: PlaybookKind;
  residencyForm?: ResidencyFormData;
  nameForm: NameFormData;
  template?: OnboardingTemplate;
};

const getRequiredKybCollectFields = () => [
  CollectedKybDataOption.name,
  CollectedKybDataOption.address,
  CollectedKybDataOption.tin,
  CollectedKybDataOption.kycedBeneficialOwners,
];

const getRequiredKycCollectFields = () => [
  CollectedKycDataOption.email,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.address,
];

const processPlaybook = ({
  kind,
  nameForm,
  playbook,
  residencyForm,
  template,
}: ProcessPlaybookProps) => {
  const mustCollectData: CollectedDataOption[] = [];
  const optionalData: CollectedDataOption[] = [];
  const { personal, businessInformation } = playbook;

  const requiredKycFields = getRequiredKycCollectFields();
  if (isAuth(kind)) {
    mustCollectData.push(CollectedKycDataOption.email);
  } else if (!isIdDoc(kind)) {
    mustCollectData.push(...requiredKycFields);
  }

  // US Legal Status
  if (personal[CollectedKycDataOption.usLegalStatus]) {
    mustCollectData.push(CollectedKycDataOption.usLegalStatus);
  }

  // SSN handling
  if (personal.ssn && !personal.ssnOptional && personal.ssnKind) {
    mustCollectData.push(personal.ssnKind);
  } else if (personal.ssnOptional && personal.ssnKind) {
    optionalData.push(personal.ssnKind);
  }

  // no phone flows handling
  if (personal[CollectedKycDataOption.phoneNumber]) {
    mustCollectData.push(CollectedKycDataOption.phoneNumber);
  }
  const isNoPhoneFlow =
    !personal[CollectedKycDataOption.phoneNumber] && !isIdDoc(kind);

  // id doc handling
  const {
    idDoc,
    idDocKind,
    selfie,
    idDocFirst,
    ssnDocScanStepUp,
    countrySpecificIdDocKind,
  } = personal;
  const docString = selfie ? 'document_and_selfie' : 'document';
  if (
    idDoc &&
    (idDocKind?.length > 0 || Object.keys(countrySpecificIdDocKind).length > 0)
  ) {
    mustCollectData.push(docString);
  }

  let docScanForOptionalSsn;
  if (ssnDocScanStepUp && idDocKind?.length > 0) {
    docScanForOptionalSsn = docString;
  }

  const isDocFirstFlow =
    (idDocFirst && idDoc && idDocKind?.length > 0) ?? false;

  // investor profile handling
  if (
    playbook?.[CollectedInvestorProfileDataOption.investorProfile] &&
    isKyc(kind)
  ) {
    mustCollectData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  // KYB field handling;
  const optionalKYBFields = [
    CollectedKybDataOption.corporationType,
    CollectedKybDataOption.website,
    CollectedKybDataOption.phoneNumber,
  ];

  if (isKyb(kind) && businessInformation) {
    const requiredKybFields = getRequiredKybCollectFields();
    mustCollectData.push(...requiredKybFields);
    optionalKYBFields.forEach(field => {
      if (businessInformation[field as keyof BusinessInformation]) {
        mustCollectData.push(field);
      }
    });
  }

  const { name } = nameForm;
  // We removed the ability to configure canAccessData separately from mustCollectData (and optionalData).
  // No tenants are currently using this, so we simplify the playbook creation flow by always
  // assuming canAccess = mustCollect + optional
  const canAccessData = mustCollectData.concat(optionalData);
  const documentTypesAndCountries = {
    countrySpecific: countrySpecificIdDocKind,
    global: idDocKind,
  };
  const skipConfirm = isIdDoc(kind);

  return {
    canAccessData,
    isDocFirstFlow,
    isNoPhoneFlow,
    mustCollectData,
    name,
    optionalData,
    skipConfirm,
    docScanForOptionalSsn,
    documentTypesAndCountries,
    ...getResidency(residencyForm),
    cipKind: template === OnboardingTemplate.Alpaca ? 'alpaca' : undefined,
  };
};

const getResidency = (residencyForm?: ResidencyFormData) => {
  if (!residencyForm) {
    return {};
  }
  const {
    allowUsResidents,
    allowUsTerritories,
    allowInternationalResidents,
    restrictCountries,
    countryList,
  } = residencyForm;

  if (restrictCountries === CountryRestriction.restrict && countryList) {
    const internationalCountryRestrictions: string[] = [];
    const countryListCode = countryList.map(country => country.value);
    internationalCountryRestrictions.push(...countryListCode);
    return {
      allowUsResidents,
      allowUsTerritories,
      allowInternationalResidents,
      internationalCountryRestrictions,
    };
  }
  return {
    allowUsResidents,
    allowUsTerritories: allowInternationalResidents
      ? false
      : allowUsTerritories,
    allowInternationalResidents,
    internationalCountryRestrictions: null,
  };
};

export default processPlaybook;
