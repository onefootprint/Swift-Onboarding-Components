import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { isAuth, isKyb, isKyc } from '@/playbooks/utils/kind';
import type {
  BusinessInformation,
  NameFormData,
  PlaybookKind,
  ResidencyFormData,
  SummaryFormData,
} from '@/playbooks/utils/machine/types';
import { CountryRestriction } from '@/playbooks/utils/machine/types';

type ProcessPlaybookProps = {
  playbook: SummaryFormData;
  kind: PlaybookKind;
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
  kind,
  nameForm,
  playbook,
  residencyForm,
}: ProcessPlaybookProps) => {
  const mustCollectData: CollectedDataOption[] = [];
  const optionalData: CollectedDataOption[] = [];
  const { personal, businessInformation } = playbook;

  const requiredKycFields = getRequiredKycCollectFields();
  if (isAuth(kind)) {
    mustCollectData.push(CollectedKycDataOption.email);
  } else {
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
  const isNoPhoneFlow = !personal[CollectedKycDataOption.phoneNumber];

  // id doc handling
  const { idDoc, idDocKind, selfie, idDocFirst, ssnDocScanStepUp } = personal;
  let docString = '';
  if (idDoc && idDocKind?.length > 0) {
    const docKinds = idDocKind.join(',');
    const selfieParam = selfie ? 'require_selfie' : 'none';
    docString = `document.${docKinds}.none.${selfieParam}`;
    mustCollectData.push(docString);
  }

  let docScanForOptionalSsn;
  if (ssnDocScanStepUp && idDocKind?.length > 0) {
    const docKinds = idDocKind.join(',');
    const selfieParam = selfie ? 'require_selfie' : 'none';
    docScanForOptionalSsn = `document.${docKinds}.none.${selfieParam}`;
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

  return {
    canAccessData,
    isDocFirstFlow,
    isNoPhoneFlow,
    mustCollectData,
    name,
    optionalData,
    docScanForOptionalSsn,
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
    allowUsTerritories: allowInternationalResidents
      ? false
      : allowUsTerritories,
    allowInternationalResidents,
    internationalCountryRestrictions: null,
  };
};

export default processPlaybook;
