import { CollectedKycDataOption, OrgRoleScope } from '@onefootprint/types';

export type Option = {
  label: string;
  value: OrgRoleScope;
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
        { value: `decrypt.${CollectedKycDataOption.name}`, label: 'Full name' },
        { value: `decrypt.${CollectedKycDataOption.email}`, label: 'Email' },
        {
          value: `decrypt.${CollectedKycDataOption.phoneNumber}`,
          label: 'Phone number',
        },
      ],
    },
    {
      label: 'Identity data',
      options: [
        {
          value: `decrypt.${CollectedKycDataOption.ssn9}`,
          label: 'SSN',
        },
        {
          value: `decrypt.${CollectedKycDataOption.ssn4}`,
          label: 'SSN (last 4)',
        },
        {
          value: `decrypt.${CollectedKycDataOption.dob}`,
          label: 'Date of Birth',
        },
        { value: 'decrypt_documents', label: 'ID document' },
      ],
    },
    {
      label: 'Address data',
      options: [
        {
          value: `decrypt.${CollectedKycDataOption.fullAddress}`,
          label: 'Full address',
        },
        {
          value: `decrypt.${CollectedKycDataOption.partialAddress}`,
          label: 'Partial address',
        },
      ],
    },
    {
      label: 'Other',
      options: [
        {
          value: 'decrypt_custom',
          label: 'Custom data',
        },
      ],
    },
  ];
  return defaultOptions;
};

export default useDecryptOptions;
