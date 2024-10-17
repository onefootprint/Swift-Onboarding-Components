import {
  type CollectedDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
  OnboardingConfigKind,
  type OrgOnboardingConfigCreateRequest,
} from '@onefootprint/types';
import { createAdditionalDocsPayload, createRequiredAuthMethodsPayload } from '../../../utils/create-payload';
import type { InvestorFormData } from '../../investor';
import type { NameFormData } from '../../name-step';
import type { RequiredAuthMethodsFormData } from '../../required-auth-methods-step';
import type { ResidencyFormData } from '../../residency-step';
import type { DetailsFormData } from '../components/details-step';
import { OnboardingTemplate, type TemplatesFormData } from '../components/templates-step';
import type { VerificationChecksFormData } from '../components/verification-checks-step';

type KycFlowFormData = {
  nameForm: NameFormData;
  templateForm: TemplatesFormData;
  residencyForm: ResidencyFormData;
  detailsForm: DetailsFormData;
  requiredAuthMethodsForm: RequiredAuthMethodsFormData;
  verificationChecksForm: VerificationChecksFormData;
};

const createPayload = ({
  nameForm,
  templateForm,
  residencyForm,
  detailsForm,
  requiredAuthMethodsForm,
  verificationChecksForm,
}: KycFlowFormData): OrgOnboardingConfigCreateRequest => {
  return {
    name: nameForm.name,
    kind: OnboardingConfigKind.kyc,
    documentTypesAndCountries: {
      countrySpecific: detailsForm.gov.country,
      global: detailsForm.gov.global,
    },
    cipKind: templateForm.template === OnboardingTemplate.Alpaca ? 'alpaca' : undefined,
    ...createResidencyPayload(residencyForm),
    ...createMustCollect(detailsForm.person, detailsForm.investor),
    ...createAdditionalDocsPayload(detailsForm.docs),
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
  { ssn, phoneNumber, usLegalStatus, usTaxIdAcceptable }: DetailsFormData['person'],
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

const createVerificationChecks = (verificationChecksForm: VerificationChecksFormData) => {
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
