import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import type {
  AuthorizedScopesFormData,
  BusinessInformation,
  NameFormData,
  PlaybookFormData,
  ResidencyFormData,
} from '@/playbooks/utils/machine/types';
import {
  CountryRestriction,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

type ProcessPlaybookProps = {
  playbook: PlaybookFormData;
  kind: PlaybookKind;
  authorizedScopes: AuthorizedScopesFormData;
  residencyForm?: ResidencyFormData;
  nameForm: NameFormData;
};

const getRequiredKybCollectFields = () => [
  CollectedKybDataOption.name,
  CollectedKybDataOption.address,
  CollectedKybDataOption.tin,
  CollectedKybDataOption.beneficialOwners,
];

const getRequiredKycCollectFields = () => [
  CollectedKycDataOption.email,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.address,
];

const processPlaybook = ({
  authorizedScopes,
  kind,
  nameForm,
  playbook,
  residencyForm,
}: ProcessPlaybookProps) => {
  const mustCollectData: CollectedDataOption[] = [];
  const canAccessData: CollectedDataOption[] = [];
  const optionalData: CollectedDataOption[] = [];

  const { personalInformationAndDocs, businessInformation } = playbook;

  const requiredKycFields = getRequiredKycCollectFields();
  mustCollectData.push(...requiredKycFields);

  // US Legal Status
  if (personalInformationAndDocs[CollectedKycDataOption.usLegalStatus]) {
    mustCollectData.push(CollectedKycDataOption.usLegalStatus);
  }

  // SSN handling
  if (
    personalInformationAndDocs.ssn &&
    !personalInformationAndDocs.ssnOptional &&
    personalInformationAndDocs.ssnKind
  ) {
    mustCollectData.push(personalInformationAndDocs.ssnKind);
  } else if (
    personalInformationAndDocs.ssnOptional &&
    personalInformationAndDocs.ssnKind
  ) {
    optionalData.push(personalInformationAndDocs.ssnKind);
  }

  // no phone flows handling
  if (personalInformationAndDocs[CollectedKycDataOption.phoneNumber]) {
    mustCollectData.push(CollectedKycDataOption.phoneNumber);
  }
  const isNoPhoneFlow =
    !personalInformationAndDocs[CollectedKycDataOption.phoneNumber];

  // id doc handling
  const { idDoc, idDocKind, selfie, idDocFirst } = personalInformationAndDocs;
  let docString = '';
  if (idDoc && idDocKind?.length > 0) {
    const docKinds = idDocKind.join(',');
    const selfieParam = selfie ? 'require_selfie' : 'none';
    docString = `document.${docKinds}.none.${selfieParam}`;
    mustCollectData.push(docString);
  }

  const isDocFirstFlow =
    (idDocFirst && idDoc && idDocKind?.length > 0) ?? false;

  // investor profile handling
  if (
    playbook?.[CollectedInvestorProfileDataOption.investorProfile] &&
    kind === PlaybookKind.Kyc
  ) {
    mustCollectData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  // authorized scopes
  const authorizedScopesKeys = Object.keys(authorizedScopes);
  authorizedScopesKeys.forEach(key => {
    if (
      authorizedScopes[key as keyof AuthorizedScopesFormData] &&
      key !== 'allBusinessData' &&
      key !== CollectedDocumentDataOption.document &&
      mustCollectData.includes(key)
    ) {
      canAccessData.push(key);
    }
  });

  if (authorizedScopes[CollectedDocumentDataOption.document] && docString) {
    canAccessData.push(docString);
  }
  if (optionalData.length > 0) {
    canAccessData.push(...optionalData);
  }

  // KYB field handling;
  const optionalKYBFields = [
    CollectedKybDataOption.corporationType,
    CollectedKybDataOption.website,
    CollectedKybDataOption.phoneNumber,
  ];

  if (kind === PlaybookKind.Kyb && businessInformation) {
    const requiredKybFields = getRequiredKybCollectFields();
    mustCollectData.push(...requiredKybFields);
    optionalKYBFields.forEach(field => {
      if (businessInformation[field as keyof BusinessInformation]) {
        mustCollectData.push(field);
      }
    });

    if (authorizedScopes?.allBusinessData) {
      canAccessData.push(...getRequiredKybCollectFields());
      optionalKYBFields.forEach(field => {
        if (
          businessInformation[field as keyof BusinessInformation] &&
          mustCollectData.includes(field)
        ) {
          canAccessData.push(field);
        }
      });
    }
  }

  const { name } = nameForm;

  return {
    canAccessData,
    isDocFirstFlow,
    isNoPhoneFlow,
    mustCollectData,
    name,
    optionalData,
    ...getResidency(residencyForm),
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
    allowUsTerritories,
    allowInternationalResidents,
    internationalCountryRestrictions: null,
  };
};

export default processPlaybook;
