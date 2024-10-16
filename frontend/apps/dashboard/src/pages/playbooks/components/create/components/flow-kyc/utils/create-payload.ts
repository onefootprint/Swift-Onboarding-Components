import {
  type CollectedDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
  OnboardingConfigKind,
  type OrgOnboardingConfigCreateRequest,
} from '@onefootprint/types';
import type { KycPersonFormData } from '../../collect-kyc-person';
import type { InvestorFormData } from '../../investor';
import type { KycFormData } from '../../person-data';
import type { KycVerificationChecksFormData } from '../../step-kyc-verification-checks';
import type { NameFormData } from '../../step-name';
import type { RequiredAuthMethodsFormData } from '../../step-required-auth-methods';
import type { ResidencyFormData } from '../../step-residency';

import { createAdditionalDocsPayload, createRequiredAuthMethodsPayload } from '../../../utils/create-payload';

type KycFlowFormData = {
  nameForm: NameFormData;
  residencyForm: ResidencyFormData;
  kycForm: KycFormData;
  requiredAuthMethodsForm: RequiredAuthMethodsFormData;
  verificationChecksForm: KycVerificationChecksFormData;
};

const createPayload = ({
  nameForm,
  residencyForm,
  kycForm,
  requiredAuthMethodsForm,
  verificationChecksForm,
}: KycFlowFormData): OrgOnboardingConfigCreateRequest => {
  return {
    name: nameForm.name,
    kind: OnboardingConfigKind.kyc,
    documentTypesAndCountries: {
      countrySpecific: kycForm.gov.country,
      global: kycForm.gov.global,
    },
    ...createResidencyPayload(residencyForm),
    ...createMustCollect(kycForm.person, kycForm.investor),
    ...createAdditionalDocsPayload(kycForm.docs),
    ...createRequiredAuthMethodsPayload(requiredAuthMethodsForm),
    ...createVerificationChecks(verificationChecksForm),
  };
};

const requiredKycFields = [
  CollectedKycDataOption.email,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.address,
];

const createMustCollect = (
  { ssn, phoneNumber, usLegalStatus, usTaxIdAcceptable }: KycPersonFormData['person'],
  { collect: collectInvestorQuestion }: InvestorFormData['investor'],
) => {
  const mustCollectData: CollectedDataOption[] = [...requiredKycFields];
  const optionalData: CollectedDataOption[] = [];

  if (phoneNumber) {
    mustCollectData.push(CollectedKycDataOption.phoneNumber);
  }
  if (usLegalStatus) {
    mustCollectData.push(CollectedKycDataOption.usLegalStatus);
  }
  if (collectInvestorQuestion) {
    mustCollectData.push(CollectedInvestorProfileDataOption.investorProfile);
  }
  if (ssn.collect && ssn.kind && !ssn.optional) {
    if (ssn.kind === CollectedKycDataOption.ssn9 && usTaxIdAcceptable) {
      mustCollectData.push(CollectedKycDataOption.usTaxId);
    }
    mustCollectData.push(ssn.kind);
  } else {
    optionalData.push(ssn.kind);
  }
  return {
    mustCollectData,
    optionalData,
    canAccessData: [...mustCollectData, ...optionalData],
  };
};

const createResidencyPayload = (residencyForm: ResidencyFormData) => {
  const { allowUsTerritories, countryList, residencyType } = residencyForm;

  // We can't create a playbook with US and International
  if (residencyType === 'international') {
    return {
      allowUsResidents: false,
      allowUsTerritories: false,
      allowInternationalResidents: true,
      internationalCountryRestrictions: countryList.length ? countryList.map(country => country.value) : null,
    };
  }
  return {
    allowUsResidents: true,
    allowUsTerritories,
    allowInternationalResidents: false,
  };
};

const createVerificationChecks = (verificationChecksForm: KycVerificationChecksFormData) => {
  return {
    enhancedAml: verificationChecksForm.aml,
    verificationChecks: [
      ...(verificationChecksForm.isNeuroEnabled ? [{ kind: 'neuro_id', data: {} }] : []),
      ...(verificationChecksForm.isSentilinkEnabled ? [{ kind: 'sentilink', data: {} }] : []),
      ...(verificationChecksForm.runKyc ? [{ kind: 'kyc', data: {} }] : []),
    ],
  };
};

export default createPayload;
