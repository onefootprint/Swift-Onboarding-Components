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
  const defaultOptions: Group[] = [
    {
      label: 'Basic Data',
      options: [
        { value: RoleScope.decryptName, label: 'Full name' },
        { value: RoleScope.decryptEmail, label: 'Email' },
        {
          value: RoleScope.decryptPhoneNumber,
          label: 'Phone number',
        },
      ],
    },
    {
      label: 'Identity data',
      options: [
        {
          value: RoleScope.decryptSsn9,
          label: 'SSN',
        },
        {
          value: RoleScope.decryptSsn4,
          label: 'SSN (last 4)',
        },
        {
          value: RoleScope.decryptDob,
          label: 'Date of Birth',
        },
        { value: RoleScope.decryptDocuments, label: 'ID document' },
      ],
    },
    {
      label: 'Address data',
      options: [
        {
          value: RoleScope.decryptFullAddress,
          label: 'Full address',
        },
        {
          value: RoleScope.decryptPartialAddress,
          label: 'Partial address',
        },
      ],
    },
    {
      label: 'Other',
      options: [
        {
          value: RoleScope.decryptCustom,
          label: 'Custom data',
        },
      ],
    },
  ];
  return defaultOptions;
};

export default useDecryptOptions;
