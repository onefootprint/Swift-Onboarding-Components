import type { ApiKey } from '../data';

export type OrgApiKeyUpdateRequest = ApiKey & { roleId?: string };

export type OrgApiKeyUpdateResponse = ApiKey;
