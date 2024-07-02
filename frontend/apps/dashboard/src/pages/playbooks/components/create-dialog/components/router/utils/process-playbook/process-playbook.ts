import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import { isAuth, isIdDocOnly, isKyb, isKyc } from '@/playbooks/utils/kind';
import type {
  BusinessInformation,
  DataToCollectFormData,
  KybChecksKind,
  NameFormData,
  Personal,
  ResidencyFormData,
} from '@/playbooks/utils/machine/types';
import {
  CountryRestriction,
  KycOptionsForBeneficialOwners,
  OnboardingTemplate,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

type OptionalSSN = CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9 | undefined;
type MandatorySSN = OptionalSSN | CollectedKycDataOption.usTaxId;
type ProcessPlaybookProps = {
  playbook: DataToCollectFormData;
  kind: PlaybookKind;
  residencyForm?: ResidencyFormData;
  nameForm: NameFormData;
  template?: OnboardingTemplate;
  skipKyc?: boolean;
  kycOptionForBeneficialOwners?: KycOptionsForBeneficialOwners;
  verificationChecks: {
    kyb?: {
      skip: boolean;
      kind?: KybChecksKind;
    };
  };
};

// KYB field handling;
const optionalKYBFields = [
  CollectedKybDataOption.address,
  CollectedKybDataOption.corporationType,
  CollectedKybDataOption.website,
  CollectedKybDataOption.phoneNumber,
];

const isSsn9 = (x: unknown): x is CollectedKycDataOption.ssn9 => x === CollectedKycDataOption.ssn9;
const getRequiredKybCollectFields = () => [CollectedKybDataOption.name, CollectedKybDataOption.tin];

const getRequiredKycCollectFields = () => [
  CollectedKycDataOption.email,
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.address,
];

export const getMandatoryAndOptionalTaxIdFields = (x: Personal): [MandatorySSN, OptionalSSN] => {
  const mandatory = !!x.ssn && !!x.ssnKind && !x.ssnOptional ? x.ssnKind : undefined;
  const optional = !!x.ssnKind && !!x.ssnOptional ? x.ssnKind : undefined;

  return [
    isSsn9(mandatory) && x.usTaxIdAcceptable ? CollectedKycDataOption.usTaxId : mandatory,
    isSsn9(mandatory) && x.usTaxIdAcceptable ? undefined : optional,
  ];
};

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
  const mustCollectData: CollectedDataOption[] = [];
  const optionalData: CollectedDataOption[] = [];
  const { personal, businessInformation } = playbook;
  let shouldSkipKyc = skipKyc;

  if (isKyb(kind) && businessInformation) {
    const requiredKybFields = getRequiredKybCollectFields();
    mustCollectData.push(...requiredKybFields);
    const collectBO = businessInformation[CollectedKybDataOption.beneficialOwners];
    if (collectBO && !skipKyc) {
      if (kycOptionForBeneficialOwners === KycOptionsForBeneficialOwners.all) {
        mustCollectData.push(CollectedKybDataOption.kycedBeneficialOwners);
      } else if (kycOptionForBeneficialOwners === KycOptionsForBeneficialOwners.primary) {
        mustCollectData.push(CollectedKybDataOption.beneficialOwners);
      }
    } else if (collectBO && skipKyc) {
      mustCollectData.push(CollectedKybDataOption.beneficialOwners);
    } else if (!collectBO) {
      // If we are not collecting beneficial owners, we should skip KYC by default
      shouldSkipKyc = true;
    }
    optionalKYBFields.forEach(field => {
      if (businessInformation[field as keyof BusinessInformation]) {
        mustCollectData.push(field);
      }
    });
  }
  const omitBeneficialOwnersKycForKybPlaybook =
    isKyb(kind) && !businessInformation?.[CollectedKybDataOption.beneficialOwners];

  if (omitBeneficialOwnersKycForKybPlaybook) {
    return {
      ...getNoBoKycOptions({
        mustCollectData,
        optionalData,
        nameForm,
        shouldSkipKyc,
        residencyForm,
      }),
      verificationChecks: getVerificationChecks({ verificationChecks, kind }),
    };
  }

  const requiredKycFields = getRequiredKycCollectFields();
  if (isAuth(kind)) {
    mustCollectData.push(CollectedKycDataOption.email);
  } else if (!isIdDocOnly(kind)) {
    mustCollectData.push(...requiredKycFields);
  }

  // US Legal Status
  if (personal[CollectedKycDataOption.usLegalStatus]) {
    mustCollectData.push(CollectedKycDataOption.usLegalStatus);
  }

  // SSN handling
  const [mandatorySSN, optionalSSN] = getMandatoryAndOptionalTaxIdFields(personal);
  if (mandatorySSN) mustCollectData.push(mandatorySSN);
  if (optionalSSN) optionalData.push(optionalSSN);

  // no phone flows handling
  if (personal[CollectedKycDataOption.phoneNumber]) {
    mustCollectData.push(CollectedKycDataOption.phoneNumber);
  }
  const isNoPhoneFlow = !personal[CollectedKycDataOption.phoneNumber] && !isIdDocOnly(kind);

  // id doc handling
  const { global = [], country, selfie, idDocFirst } = personal.docs;
  const hasIdDocuments = global.length > 0 || Object.keys(country).length > 0;
  if (hasIdDocuments) {
    mustCollectData.push(selfie ? 'document_and_selfie' : 'document');
  }

  // investor profile handling
  if (playbook?.[CollectedInvestorProfileDataOption.investorProfile] && isKyc(kind)) {
    mustCollectData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  const { name } = nameForm;
  // We removed the ability to configure canAccessData separately from mustCollectData (and optionalData).
  // No tenants are currently using this, so we simplify the playbook creation flow by always
  // assuming canAccess = mustCollect + optional
  const canAccessData = mustCollectData.concat(optionalData);
  const documentTypesAndCountries = {
    countrySpecific: country,
    global: global,
  };
  const skipConfirm = isIdDocOnly(kind);

  return {
    canAccessData,
    isDocFirstFlow: idDocFirst,
    isNoPhoneFlow,
    mustCollectData,
    name,
    optionalData,
    skipConfirm,
    skipKyc: shouldSkipKyc,
    documentTypesAndCountries,
    verificationChecks: getVerificationChecks({ kind, verificationChecks }),
    ...getResidency(residencyForm),
    cipKind: template === OnboardingTemplate.Alpaca ? 'alpaca' : undefined,
  };
};

const getVerificationChecks = ({
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

const getResidency = (residencyForm?: ResidencyFormData) => {
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

const getNoBoKycOptions = ({
  mustCollectData,
  optionalData,
  nameForm,
  shouldSkipKyc,
  residencyForm,
}: {
  mustCollectData: CollectedDataOption[];
  optionalData: CollectedDataOption[];
  nameForm: NameFormData;
  shouldSkipKyc?: boolean;
  residencyForm?: ResidencyFormData;
}) => {
  const { name } = nameForm;
  const canAccessData = mustCollectData.concat(optionalData);
  const documentTypesAndCountries = {
    countrySpecific: {},
    global: [],
  };
  const skipConfirm = false;
  return {
    canAccessData,
    isDocFirstFlow: false,
    isNoPhoneFlow: false,
    mustCollectData,
    name,
    optionalData,
    skipConfirm,
    skipKyc: shouldSkipKyc,
    documentTypesAndCountries,
    ...getResidency(residencyForm),
    cipKind: undefined,
  };
};

export default processPlaybook;
