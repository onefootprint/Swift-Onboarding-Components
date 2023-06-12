import { useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';

export type Option = {
  label: string;
  value: RoleScope;
};

export type Group = {
  options: readonly Option[];
  label?: string;
};

const useDecryptOptions = () => {
  const { t } = useTranslation('pages.settings.roles.scopes');

  const defaultOptions: Group[] = [
    {
      label: 'Basic Data',
      options: [
        { value: RoleScope.decryptName, label: t('decrypt.name') },
        { value: RoleScope.decryptEmail, label: t('decrypt.email') },
        {
          value: RoleScope.decryptPhoneNumber,
          label: t('decrypt.phone_number'),
        },
      ],
    },
    {
      label: 'Identity data',
      options: [
        {
          value: RoleScope.decryptSsn9,
          label: t('decrypt.ssn9'),
        },
        {
          value: RoleScope.decryptSsn4,
          label: t('decrypt.ssn4'),
        },
        {
          value: RoleScope.decryptDob,
          label: t('decrypt.dob'),
        },
        { value: RoleScope.decryptDocuments, label: t('decrypt.documents') },
      ],
    },
    {
      label: 'Address data',
      options: [
        {
          value: RoleScope.decryptFullAddress,
          label: t('decrypt.full_address'),
        },
        {
          value: RoleScope.decryptPartialAddress,
          label: t('decrypt.partial_address'),
        },
      ],
    },
    {
      label: 'Other',
      options: [
        {
          value: RoleScope.decryptCustom,
          label: t('decrypt.custom'),
        },
        {
          value: RoleScope.decryptInvestorProfile,
          label: t('decrypt.investor_profile'),
        },
        {
          value: RoleScope.decryptCard,
          label: t('decrypt.card'),
        },
      ],
    },
  ];
  return defaultOptions;
};

export default useDecryptOptions;
