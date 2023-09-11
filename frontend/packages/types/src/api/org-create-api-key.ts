import type { ApiKey } from '../data';

export type OrgCreateApiKeyRequest = {
  name: string;
  roleId: string;
};

export type OrgCreateApiKeysResponse = ApiKey;
