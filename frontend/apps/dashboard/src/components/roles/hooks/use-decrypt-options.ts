import type { RoleScope } from '@onefootprint/types';
import { CollectedInvestorProfileDataOption, CollectedKycDataOption, RoleScopeKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

// These aren't sent to the API - just used to represent all the options of decryptable things in
// the MultiSelect. We need this since different decrypt options have special serializations in the API
export enum DecryptOption {
  all = 'all',
  name = 'name',
  email = 'email',
  phoneNumber = 'phone_number',
  ssn9 = 'ssn9',
  ssn4 = 'ssn4',
  dob = 'dob',
  documents = 'documents',
  fullAddress = 'full_address',
  custom = 'custom',
  investorProfile = 'investor_profile',
  usLegalStatus = 'us_legal_status',
  card = 'card',
}

/// Reverse lookup of DecryptOptionToRoleScope
export const decryptOptionFromScope = (scope: RoleScope): DecryptOption | undefined => {
  const result = Object.entries(DecryptOptionToRoleScope).find(opt => scopeEqual(opt[1], scope));
  return result?.[0] as DecryptOption;
};

const scopeEqual = (a: RoleScope, b: RoleScope) => {
  // Non-decrypt scopes just need the type to match
  if (a.kind !== RoleScopeKind.decrypt && a.kind === b.kind) {
    return true;
  }
  // For decrypt scopes, check that the data matches
  if (a.kind === RoleScopeKind.decrypt && b.kind === RoleScopeKind.decrypt && a.data === b.data) {
    return true;
  }
  return false;
};

export const DecryptOptionToRoleScope: Record<DecryptOption, RoleScope> = {
  [DecryptOption.all]: { kind: RoleScopeKind.decryptAll },
  [DecryptOption.name]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.name,
  },
  [DecryptOption.email]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.email,
  },
  [DecryptOption.phoneNumber]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.phoneNumber,
  },
  [DecryptOption.ssn9]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.ssn9,
  },
  [DecryptOption.ssn4]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.ssn4,
  },
  [DecryptOption.dob]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.dob,
  },
  [DecryptOption.documents]: {
    kind: RoleScopeKind.decryptDocuments,
  },
  [DecryptOption.fullAddress]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.address,
  },
  [DecryptOption.usLegalStatus]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedKycDataOption.usLegalStatus,
  },
  [DecryptOption.custom]: {
    kind: RoleScopeKind.decryptCustom,
  },
  [DecryptOption.investorProfile]: {
    kind: RoleScopeKind.decrypt,
    data: CollectedInvestorProfileDataOption.investorProfile,
  },
  [DecryptOption.card]: {
    kind: RoleScopeKind.decrypt,
    data: 'card',
  },
};

type Option = {
  label: string;
  value: DecryptOption;
};

type Group = {
  options: readonly Option[];
  label?: string;
};

const useDecryptOptions = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.roles.scopes',
  });

  const options: Group[] = [
    {
      label: 'Basic Data',
      options: [
        {
          value: DecryptOption.name,
          label: t('decrypt.name'),
        },
        {
          value: DecryptOption.email,
          label: t('decrypt.email'),
        },
        {
          value: DecryptOption.phoneNumber,
          label: t('decrypt.phone_number'),
        },
      ],
    },
    {
      label: 'Identity data',
      options: [
        {
          value: DecryptOption.ssn9,
          label: t('decrypt.ssn9'),
        },
        {
          value: DecryptOption.ssn4,
          label: t('decrypt.ssn4'),
        },
        {
          value: DecryptOption.dob,
          label: t('decrypt.dob'),
        },
        {
          value: DecryptOption.documents,
          label: t('decrypt.documents'),
        },
      ],
    },
    {
      label: 'Address data',
      options: [
        {
          value: DecryptOption.fullAddress,
          label: t('decrypt.full_address'),
        },
      ],
    },
    {
      label: 'Other',
      options: [
        {
          value: DecryptOption.custom,
          label: t('decrypt.custom'),
        },
        {
          value: DecryptOption.investorProfile,
          label: t('decrypt.investor_profile'),
        },
        {
          value: DecryptOption.usLegalStatus,
          label: t('decrypt.us_legal_status'),
        },
        {
          value: DecryptOption.card,
          label: t('decrypt.card'),
        },
      ],
    },
  ];
  const allOption = {
    value: DecryptOption.all,
    label: t('decrypt_all'),
  };
  return { options, allOption };
};

export default useDecryptOptions;
