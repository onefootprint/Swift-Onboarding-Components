import {
  type CollectedDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  type CustomDI,
  type DocumentRequestConfig,
  DocumentRequestKind,
  OnboardingConfigKind,
  type OrgOnboardingConfigCreateRequest,
} from '@onefootprint/types';
import type { NameFormData } from '../../name-step';
import type { RequiredAuthMethodsFormData } from '../../required-auth-methods-step';
import type { BoFormData } from '../components/bo-step';
import type { BusinessFormData } from '../components/business-step';
import type { VerificationChecksFormData } from '../components/verification-checks-step';

import { createAdditionalDocsPayload, createRequiredAuthMethodsPayload } from '../../../utils/create-payload';

type KycFlowFormData = {
  nameForm: NameFormData;
  businessForm: BusinessFormData;
  boForm: BoFormData;
  requiredAuthMethodsForm: RequiredAuthMethodsFormData;
  verificationChecksForm: VerificationChecksFormData;
};

const requiredKybFields = [CollectedKybDataOption.name, CollectedKybDataOption.tin];

const requiredKycFields = [
  CollectedKycDataOption.email,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.address,
];

const createPayload = ({
  nameForm,
  businessForm,
  boForm,
  requiredAuthMethodsForm,
  verificationChecksForm,
}: KycFlowFormData): OrgOnboardingConfigCreateRequest => {
  const collectsBO = boForm.data.collect;
  const { mustCollectData: personMustCollectData, optionalData: personOptionalData } = createPersonPayload(
    boForm.data,
    {
      collectsBO,
    },
  );
  const businessMustCollectData = createBusinessPayload(businessForm, {
    collectsBO,
    runKyc: verificationChecksForm.runKyc,
  });
  console.log('personMustCollectData', personMustCollectData);
  console.log('businessMustCollectData', businessMustCollectData);

  const mustCollectData = [...personMustCollectData, ...businessMustCollectData];

  return {
    name: nameForm.name,
    kind: OnboardingConfigKind.kyb,
    allowUsResidents: true,
    allowUsTerritories: false,
    allowInternationalResidents: false,
    documentTypesAndCountries: {
      countrySpecific: boForm.gov.country,
      global: boForm.gov.global,
    },
    mustCollectData,
    canAccessData: mustCollectData,
    optionalData: personOptionalData,
    ...createAdditionalDocsPayload(boForm.docs),
    ...createBusinessDocumentsPayload(businessForm),
    ...createRequiredAuthMethodsPayload(requiredAuthMethodsForm),
    ...createVerificationChecksPayload(verificationChecksForm),
  };
};

const createPersonPayload = (
  { ssn, phoneNumber, usLegalStatus, usTaxIdAcceptable }: BoFormData['data'],
  meta: {
    collectsBO: boolean;
  },
) => {
  if (!meta.collectsBO) {
    return {
      mustCollectData: [],
      optionalData: [],
    };
  }
  const mustCollectData: CollectedDataOption[] = [...requiredKycFields];
  const optionalData: CollectedDataOption[] = [];
  if (phoneNumber) {
    mustCollectData.push(CollectedKycDataOption.phoneNumber);
  }
  if (usLegalStatus) {
    mustCollectData.push(CollectedKycDataOption.usLegalStatus);
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
  };
};

const createBusinessDocumentsPayload = (businessForm: BusinessFormData) => {
  const documentsToCollect: DocumentRequestConfig[] = [];
  businessForm.docs.custom.forEach(doc => {
    documentsToCollect.push({
      kind: DocumentRequestKind.Custom,
      data: {
        description: doc.description,
        identifier: `document.custom.${doc.identifier}` as CustomDI,
        name: doc.name,
        requiresHumanReview: true,
        uploadSettings: doc.uploadSettings,
      },
    });
  });
  return {
    businessDocumentsToCollect: documentsToCollect,
  };
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
    mustCollectData.push(CollectedKybDataOption.kycedBeneficialOwners);
  }
  if (businessForm.data.address) {
    mustCollectData.push(CollectedKybDataOption.address);
  }
  if (businessForm.data.website) {
    mustCollectData.push(CollectedKybDataOption.website);
  }
  if (businessForm.data.phoneNumber) {
    mustCollectData.push(CollectedKybDataOption.phoneNumber);
  }
  if (businessForm.data.type) {
    mustCollectData.push(CollectedKybDataOption.corporationType);
  }
  return mustCollectData;
};

const createVerificationChecksPayload = (verificationChecksForm: VerificationChecksFormData) => {
  return {
    enhancedAml: verificationChecksForm.aml,
    verificationChecks: [
      ...(verificationChecksForm.runKyb
        ? [
            {
              kind: 'kyb',
              data: {
                einOnly: verificationChecksForm.kybKind === 'ein',
              },
            },
          ]
        : []),
      ...(verificationChecksForm.runKyc ? [{ kind: 'kyc', data: {} }] : []),
    ],
  };
};

export default createPayload;
