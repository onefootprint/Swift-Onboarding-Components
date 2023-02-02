import { OrgRoleScope } from '@onefootprint/types';

export type FormData = {
  decryptFields: { label: string; value: OrgRoleScope }[];
  name: string;
  scopes: OrgRoleScope[];
  showDecrypt: boolean;
};
