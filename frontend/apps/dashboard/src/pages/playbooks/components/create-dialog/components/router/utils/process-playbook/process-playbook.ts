import { AuthMethodKind, CollectedDataOption, CustomDI } from '@onefootprint/types';
import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  DocumentRequestConfig,
  DocumentRequestKind,
} from '@onefootprint/types';

import { isAuth, isDocOnly, isKyb, isKyc } from '@/playbooks/utils/kind';
import type {
  DataToCollectFormData,
  KybChecksKind,
  NameFormData,
  ResidencyFormData,
} from '@/playbooks/utils/machine/types';
import {
  CountryRestriction,
  KycOptionsForBeneficialOwners,
  OnboardingTemplate,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

type ProcessPlaybookProps = {
  kind: PlaybookKind;
  kycOptionForBeneficialOwners?: KycOptionsForBeneficialOwners;
  nameForm: NameFormData;
  playbook: DataToCollectFormData;
  residencyForm?: ResidencyFormData;
  skipKyc?: boolean;
  template?: OnboardingTemplate;
  verificationChecks: {
    kyb?: {
      skip: boolean;
      kind?: KybChecksKind;
    };
  };
};

const requiredKybFields = [CollectedKybDataOption.name, CollectedKybDataOption.tin];

const requiredKycFields = [
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
  verificationChecks,
  template,
  skipKyc,
  kycOptionForBeneficialOwners,
}: ProcessPlaybookProps) => {
  const mustCollectData = [
    ...createPersonMustCollectDataPayload(playbook, kind),
    ...createBusinessMustCollectDataPayload(playbook, kind, kycOptionForBeneficialOwners, skipKyc),
  ];
  const optionalData = [...createPersonOptionalDataPayload(playbook, kind)];

  return {
    ...createResidencyPayload(residencyForm),
    isDocFirstFlow: createIsDocFirstFlowPayload(playbook, kind),
    businessDocumentsToCollect: createBusinessCustomDocsPayload(playbook, kind),
    canAccessData: [...mustCollectData, ...optionalData],
    cipKind: template === OnboardingTemplate.Alpaca ? 'alpaca' : undefined,
    documentsToCollect: createPersonAdditionalDocsPayload(playbook, kind),
    documentTypesAndCountries: createPersonGovDocsPayload(playbook, kind),
    isNoPhoneFlow: createIsNoPhoneFlowPayload(playbook, kind),
    mustCollectData,
    name: createNamePayload(nameForm),
    optionalData,
    requiredAuthMethods: createRequiredAuthMethodsPayload(playbook),
    skipConfirm: createSkipConfirmPayload(kind),
    skipKyc: createShouldSkipKyc(skipKyc || false, playbook),
    verificationChecks: createVerificationChecksPayload({ kind, verificationChecks }),
  };
};

const collectsBOInfo = (formData: DataToCollectFormData) => {
  return !!formData.business?.basic.collectBOInfo;
};

const collectsPersonInfo = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  return isKyc(kind) || (isKyb(kind) && collectsBOInfo(formData));
};

//
// Person
const createPersonMustCollectDataPayload = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  if (isAuth(kind)) {
    return createAuthMustCollectDataPayload();
  }
  if (isDocOnly(kind)) {
    return createIdDocOnlyMustCollectDataPayload(formData);
  }
  if (collectsPersonInfo(formData, kind)) {
    return createPersonBasicMustCollectDataPayload(formData);
  }
  return [];
};

const createAuthMustCollectDataPayload = () => {
  return [CollectedKycDataOption.email, CollectedKycDataOption.phoneNumber];
};

const createIdDocOnlyMustCollectDataPayload = (formData: DataToCollectFormData) => {
  const { global = [], country, selfie } = formData.person.docs.gov;
  const hasIdDocuments = global.length > 0 || Object.keys(country).length > 0;
  if (hasIdDocuments) {
    return [selfie ? 'document_and_selfie' : 'document'];
  }
  return [];
};

const createPersonAdditionalDocsPayload = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  const documentsToCollect: DocumentRequestConfig[] = [];
  if (collectsPersonInfo(formData, kind) || isDocOnly(kind)) {
    const { poa, possn, custom, requireManualReview } = formData.person.docs.additional;
    if (poa) {
      documentsToCollect.push({
        kind: DocumentRequestKind.ProofOfAddress,
        data: {
          requiresHumanReview: !!requireManualReview,
        },
      });
    }
    if (possn) {
      documentsToCollect.push({
        kind: DocumentRequestKind.ProofOfSsn,
        data: {
          requiresHumanReview: !!requireManualReview,
        },
      });
    }
    if (custom) {
      custom.forEach(doc => {
        documentsToCollect.push({
          kind: DocumentRequestKind.Custom,
          data: {
            description: doc.description,
            identifier: `document.custom.${doc.identifier}` as CustomDI,
            name: doc.name,
            requiresHumanReview: !!requireManualReview,
          },
        });
      });
    }
    return documentsToCollect;
  }
  return documentsToCollect;
};

const createPersonBasicMustCollectDataPayload = (formData: DataToCollectFormData) => {
  const mustCollectData: CollectedDataOption[] = [...requiredKycFields];
  const { basic, investorProfile } = formData.person;
  const { ssn } = basic;
  if (basic.phoneNumber) {
    mustCollectData.push(CollectedKycDataOption.phoneNumber);
  }
  if (basic.usLegalStatus) {
    mustCollectData.push(CollectedKycDataOption.usLegalStatus);
  }
  if (investorProfile) {
    mustCollectData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  if (ssn.collect && ssn.kind && !ssn.optional) {
    if (ssn.kind === CollectedKycDataOption.ssn9 && basic.usTaxIdAcceptable) {
      mustCollectData.push(CollectedKycDataOption.usTaxId);
    }
    mustCollectData.push(ssn.kind);
  }
  return [...mustCollectData, ...createIdDocOnlyMustCollectDataPayload(formData)];
};

const createPersonGovDocsPayload = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  if (collectsPersonInfo(formData, kind) || isDocOnly(kind)) {
    const { global = [], country = {} } = formData.person.docs.gov;
    return { countrySpecific: country, global: global };
  }
  return { countrySpecific: {}, global: [] };
};

const createPersonOptionalDataPayload = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  const mustCollectData: CollectedDataOption[] = [];
  if (collectsPersonInfo(formData, kind)) {
    const {
      basic: { ssn },
    } = formData.person;
    if (ssn.collect && ssn.optional && ssn.kind) {
      mustCollectData.push(ssn.kind);
    }
    return mustCollectData;
  }
  return mustCollectData;
};

const createRequiredAuthMethodsPayload = (formData: DataToCollectFormData) => {
  const requiredAuthMethods: AuthMethodKind[] = [];
  if (formData.requiredAuthMethods.email) {
    requiredAuthMethods.push(AuthMethodKind.email);
  }
  if (formData.requiredAuthMethods.phone) {
    requiredAuthMethods.push(AuthMethodKind.phone);
  }

  // we should never return an empty array, otherwise the mutation will return a validation error
  return requiredAuthMethods.length > 0 ? requiredAuthMethods : undefined;
};

//
// Business
const createBusinessMustCollectDataPayload = (
  formData: DataToCollectFormData,
  kind: PlaybookKind,
  kycOptionForBeneficialOwners?: KycOptionsForBeneficialOwners,
  skipKyc?: boolean,
) => {
  if (!isKyb(kind) || !formData.business) {
    return [];
  }
  const { business } = formData;
  const mustCollectData: CollectedDataOption[] = [...requiredKybFields];

  if (collectsBOInfo(formData)) {
    if (skipKyc) {
      mustCollectData.push(CollectedKybDataOption.beneficialOwners);
    } else {
      if (kycOptionForBeneficialOwners === KycOptionsForBeneficialOwners.all) {
        mustCollectData.push(CollectedKybDataOption.kycedBeneficialOwners);
      }
      if (kycOptionForBeneficialOwners === KycOptionsForBeneficialOwners.primary) {
        mustCollectData.push(CollectedKybDataOption.beneficialOwners);
      }
    }
  }

  if (business.basic.address) {
    mustCollectData.push(CollectedKybDataOption.address);
  }
  if (business.basic.website) {
    mustCollectData.push(CollectedKybDataOption.website);
  }
  if (business.basic.phoneNumber) {
    mustCollectData.push(CollectedKybDataOption.phoneNumber);
  }
  if (business.basic.type) {
    mustCollectData.push(CollectedKybDataOption.corporationType);
  }

  return mustCollectData;
};

const createBusinessCustomDocsPayload = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  const documentsToCollect: DocumentRequestConfig[] = [];
  if (!isKyb(kind)) {
    return documentsToCollect;
  }
  const custom = formData.business?.docs.custom;
  if (custom) {
    custom.forEach(doc => {
      documentsToCollect.push({
        kind: DocumentRequestKind.Custom,
        data: {
          description: doc.description,
          identifier: `document.custom.${doc.identifier}` as CustomDI,
          name: doc.name,
          requiresHumanReview: true,
        },
      });
    });
  }
  return documentsToCollect;
};

//
// Others
const createIsDocFirstFlowPayload = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  if (isKyc(kind)) {
    const { idDocFirst = false } = formData.person.docs.gov;
    return idDocFirst;
  }
  return false;
};

const createShouldSkipKyc = (skipKyc: boolean, formData: DataToCollectFormData) => {
  if (isKyb(formData.kind)) {
    // If we are not collecting beneficial owners, we should skip KYC by default
    return !collectsBOInfo(formData);
  }
  return skipKyc;
};

const createNamePayload = (nameForm: NameFormData) => {
  return nameForm.name;
};

const createIsNoPhoneFlowPayload = (formData: DataToCollectFormData, kind: PlaybookKind) => {
  const hasPhone = !!formData.person.basic;
  return !hasPhone && !isDocOnly(kind);
};

const createResidencyPayload = (residencyForm?: ResidencyFormData) => {
  if (!residencyForm) {
    return {};
  }
  const { allowUsResidents, allowUsTerritories, allowInternationalResidents, restrictCountries, countryList } =
    residencyForm;

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
    allowUsTerritories: allowInternationalResidents ? false : allowUsTerritories,
    allowInternationalResidents,
    internationalCountryRestrictions: null,
  };
};

const createVerificationChecksPayload = ({
  verificationChecks,
  kind,
}: {
  kind: PlaybookKind;
  verificationChecks: {
    kyb?: {
      skip: boolean;
      kind?: KybChecksKind;
    };
  };
}) => {
  if (kind === PlaybookKind.Kyb) {
    if (!verificationChecks.kyb || verificationChecks.kyb.skip) {
      return [];
    }
    return [
      {
        kind: 'kyb',
        data: {
          einOnly: verificationChecks.kyb?.kind === 'ein',
        },
      },
    ];
  }
  return null;
};
const createSkipConfirmPayload = (kind: PlaybookKind) => {
  return isDocOnly(kind);
};

export default processPlaybook;
