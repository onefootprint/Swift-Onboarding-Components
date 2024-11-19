import type {
  AdverseMediaListKind,
  CollectedDataOption,
  CreateOnboardingConfigurationRequest,
  VerificationCheck,
} from '@onefootprint/request-types/dashboard';
import {
  createAdditionalDocsPayload,
  createGovDocsPayload,
  createRequiredAuthMethodsPayload,
} from '../../../utils/create-payload';
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
}: KycFlowFormData): CreateOnboardingConfigurationRequest => {
  return {
    name: nameForm.name,
    kind: 'kyc',
    cipKind: templateForm.template === OnboardingTemplate.Alpaca ? 'alpaca' : undefined,
    documentTypesAndCountries: createGovDocsPayload(detailsForm.gov),
    documentsToCollect: createAdditionalDocsPayload(detailsForm.docs),
    requiredAuthMethods: createRequiredAuthMethodsPayload(requiredAuthMethodsForm),
    verificationChecks: createVerificationChecks(verificationChecksForm),
    ...createResidencyPayload(residencyForm),
    ...createMustCollect(detailsForm),
  };
};

const requiredKycFields: CollectedDataOption[] = ['email', 'name', 'dob', 'full_address'];

const createMustCollect = ({ person, investor, gov }: DetailsFormData) => {
  const { ssn, phoneNumber, usLegalStatus, usTaxIdAcceptable } = person;
  const { collect: collectInvestorQuestion } = investor;
  const mustCollectData: CollectedDataOption[] = [...requiredKycFields];
  const optionalData: CollectedDataOption[] = [];

  const { global = [], country, selfie } = gov;
  const hasIdDocuments = global.length > 0 || Object.keys(country).length > 0;
  if (hasIdDocuments) {
    if (selfie) {
      // @ts-expect-error: backend is deprecating this type
      mustCollectData.push('document_and_selfie');
    } else {
      // @ts-expect-error: backend is deprecating this type
      mustCollectData.push('document');
    }
  }
  if (phoneNumber) {
    mustCollectData.push('phone_number');
  }
  if (usLegalStatus) {
    mustCollectData.push('us_legal_status');
  }
  if (collectInvestorQuestion) {
    mustCollectData.push('investor_profile');
  }
  if (ssn.collect && ssn.kind) {
    if (!ssn.optional) {
      if (ssn.kind === 'ssn9' && usTaxIdAcceptable) {
        mustCollectData.push('us_tax_id');
      }
      mustCollectData.push(ssn.kind);
    } else {
      optionalData.push(ssn.kind);
    }
  }
  return {
    mustCollectData,
    optionalData,
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
      internationalCountryRestrictions: countryList.length > 0 ? countryList : undefined,
    };
  }
  return {
    allowUsResidents: true,
    allowUsTerritories,
    allowInternationalResidents: false,
  };
};

const createVerificationChecks = (verificationChecksForm: VerificationChecksFormData): VerificationCheck[] => {
  const createAdverseMediaLists = (adverseMediaList: VerificationChecksFormData['aml']['adverseMediaList']) => {
    const payload: AdverseMediaListKind[] = [];
    if (adverseMediaList.financial_crime) payload.push('financial_crime');
    if (adverseMediaList.violent_crime) payload.push('violent_crime');
    if (adverseMediaList.sexual_crime) payload.push('sexual_crime');
    if (adverseMediaList.cyber_crime) payload.push('cyber_crime');
    if (adverseMediaList.terrorism) payload.push('terrorism');
    if (adverseMediaList.fraud) payload.push('fraud');
    if (adverseMediaList.narcotics) payload.push('narcotics');
    if (adverseMediaList.general_serious) payload.push('general_serious');
    if (adverseMediaList.general_minor) payload.push('general_minor');
    return payload;
  };

  return [
    ...(verificationChecksForm.isNeuroEnabled ? [{ kind: 'neuro_id' as const, data: {} }] : []),
    ...(verificationChecksForm.isSentilinkEnabled ? [{ kind: 'sentilink' as const, data: {} }] : []),
    ...(verificationChecksForm.runKyc ? [{ kind: 'kyc' as const, data: {} }] : []),
    ...(verificationChecksForm.aml.enhancedAml
      ? [
          {
            kind: 'aml' as const,
            data: {
              continuousMonitoring: true,
              ofac: verificationChecksForm.aml.ofac,
              pep: verificationChecksForm.aml.pep,
              adverseMedia: verificationChecksForm.aml.adverseMedia,
              adverseMediaLists: createAdverseMediaLists(verificationChecksForm.aml.adverseMediaList),
              matchKind:
                verificationChecksForm.aml.matchingMethod.kind === 'fuzzy'
                  ? verificationChecksForm.aml.matchingMethod.fuzzyLevel
                  : verificationChecksForm.aml.matchingMethod.exactLevel,
            },
          },
        ]
      : []),
  ];
};

export default createPayload;
