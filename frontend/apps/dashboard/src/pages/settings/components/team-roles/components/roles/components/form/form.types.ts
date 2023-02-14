import { RoleScope } from '@onefootprint/types';

export type FormData = {
  decryptFields: { label: string; value: RoleScope }[];
  name: string;
  scopes: RoleScope[];
  showDecrypt: boolean;
};
