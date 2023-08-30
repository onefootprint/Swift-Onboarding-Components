import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

import {
  AuthorizedScopesFormData,
  BusinessInformation,
  Kind,
  NameFormData,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';

type ProcessPlaybookProps = {
  playbook: PlaybookFormData;
  kind: Kind;
  authorizedScopes: AuthorizedScopesFormData;
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
  CollectedKycDataOption.fullAddress,
];

const processPlaybook = ({
  playbook,
  kind,
  authorizedScopes,
  nameForm,
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
    kind === Kind.KYC
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

  // KYB field handling;
  const optionalKYBFields = [
    CollectedKybDataOption.corporationType,
    CollectedKybDataOption.website,
    CollectedKybDataOption.phoneNumber,
  ];

  if (kind === Kind.KYB && businessInformation) {
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
    mustCollectData,
    canAccessData,
    optionalData,
    isDocFirstFlow,
    isNoPhoneFlow,
    name,
  };
};

export default processPlaybook;
