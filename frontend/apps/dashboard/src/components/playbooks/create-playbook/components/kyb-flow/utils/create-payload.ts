import type {
  CollectedDataOption,
  CreateOnboardingConfigurationRequest,
  DocumentRequestConfig,
  VerificationCheck,
} from '@onefootprint/request-types/dashboard';
import type { NameFormData } from '../../name-step';
import type { RequiredAuthMethodsFormData } from '../../required-auth-methods-step';
import type { BoFormData } from '../components/bo-step';
import type { BusinessFormData } from '../components/business-step';
import type { VerificationChecksFormData } from '../components/verification-checks-step';

import {
  createAdditionalDocsPayload,
  createGovDocsPayload,
  createRequiredAuthMethodsPayload,
} from '../../../utils/create-payload';

type KycFlowFormData = {
  nameForm: NameFormData;
  businessForm: BusinessFormData;
  boForm: BoFormData;
  requiredAuthMethodsForm: RequiredAuthMethodsFormData;
  verificationChecksForm: VerificationChecksFormData;
};

const requiredKybFields: CollectedDataOption[] = ['business_name', 'business_tin'];

const requiredKycFields: CollectedDataOption[] = ['email', 'name', 'dob', 'full_address'];

const createPayload = ({
  nameForm,
  businessForm,
  boForm,
  requiredAuthMethodsForm,
  verificationChecksForm,
}: KycFlowFormData): CreateOnboardingConfigurationRequest => {
  const collectsBO = boForm.data.collect;
  const { mustCollectData: personMustCollectData, optionalData: personOptionalData } = createPersonPayload(boForm, {
    collectsBO,
  });
  const businessMustCollectData = createBusinessPayload(businessForm, {
    collectsBO,
    runKyc: verificationChecksForm.runKyc,
  });

  const mustCollectData = [...personMustCollectData, ...businessMustCollectData];

  return {
    name: nameForm.name,
    kind: 'kyb',
    allowUsResidents: true,
    allowUsTerritories: false,
    allowInternationalResidents: false,
    mustCollectData,
    optionalData: personOptionalData,
    documentTypesAndCountries: createGovDocsPayload(boForm.gov),
    documentsToCollect: createAdditionalDocsPayload(boForm.docs),
    requiredAuthMethods: createRequiredAuthMethodsPayload(requiredAuthMethodsForm),
    businessDocumentsToCollect: createBusinessDocumentsPayload(businessForm),
    verificationChecks: createVerificationChecksPayload(verificationChecksForm),
  };
};

const createPersonPayload = (
  { data, gov }: BoFormData,
  meta: {
    collectsBO: boolean;
  },
) => {
  const { ssn, phoneNumber, usLegalStatus, usTaxIdAcceptable } = data;
  if (!meta.collectsBO) {
    return {
      mustCollectData: [],
      optionalData: [],
    };
  }
  const mustCollectData: CollectedDataOption[] = [...requiredKycFields];
  const optionalData: CollectedDataOption[] = [];
  const { global = [], country, selfie } = gov;
  const hasIdDocuments = global.length > 0 || Object.keys(country).length > 0;
  if (hasIdDocuments) {
    if (selfie) {
      // @ts-expect-error: backend has deprecated
      mustCollectData.push('document_and_selfie');
    } else {
      // @ts-expect-error: backend has deprecated
      mustCollectData.push('document');
    }
  }
  if (phoneNumber) {
    mustCollectData.push('phone_number');
  }
  if (usLegalStatus) {
    mustCollectData.push('us_legal_status');
  }
  if (ssn.collect && ssn.kind && !ssn.optional) {
    if (ssn.kind === 'ssn9' && usTaxIdAcceptable) {
      mustCollectData.push('us_tax_id');
    }
    mustCollectData.push(ssn.kind);
  } else {
    optionalData.push(ssn.kind);
  }
  return {
    mustCollectData,
    optionalData,
  };
};

const createBusinessDocumentsPayload = (businessForm: BusinessFormData) => {
  const documentsToCollect: DocumentRequestConfig[] = [];
  businessForm.docs.custom.forEach(doc => {
    documentsToCollect.push({
      kind: 'custom',
      data: {
        description: doc.description,
        // @ts-expect-error: fix once we support template literals
        identifier: `document.custom.${doc.identifier}`,
        name: doc.name,
        requiresHumanReview: true,
        uploadSettings: doc.uploadSettings,
      },
    });
  });
  return documentsToCollect;
};

const createBusinessPayload = (
  businessForm: BusinessFormData,
  meta: {
    collectsBO: boolean;
    runKyc: boolean;
  },
) => {
  const mustCollectData: CollectedDataOption[] = [...requiredKybFields];
  if (meta.collectsBO && meta.runKyc) {
    mustCollectData.push('business_kyced_beneficial_owners');
  }
  if (businessForm.data.address) {
    mustCollectData.push('business_address');
  }
  if (businessForm.data.website) {
    mustCollectData.push('business_website');
  }
  if (businessForm.data.phoneNumber) {
    mustCollectData.push('business_website');
  }
  if (businessForm.data.type) {
    mustCollectData.push('business_corporation_type');
  }
  return mustCollectData;
};

const createVerificationChecksPayload = (verificationChecksForm: VerificationChecksFormData): VerificationCheck[] => {
  return [
    ...(verificationChecksForm.runKyb
      ? [
          {
            kind: 'kyb' as const,
            data: {
              einOnly: verificationChecksForm.kybKind === 'ein',
            },
          },
        ]
      : []),
    ...(verificationChecksForm.runKyc ? [{ kind: 'kyc' as const, data: {} }] : []),
    ...(verificationChecksForm.aml.enhancedAml ? [{ kind: 'business_aml' as const, data: {} }] : []),
  ];
};

export default createPayload;
