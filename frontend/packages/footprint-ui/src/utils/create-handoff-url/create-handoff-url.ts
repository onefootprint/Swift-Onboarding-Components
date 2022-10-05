import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';

const createHandoffUrl = (scopedAuthToken: string, tenantPk?: string) => {
  if (tenantPk) {
    return `${HANDOFF_BASE_URL}#${scopedAuthToken}#${tenantPk}`;
  }
  return `${HANDOFF_BASE_URL}#${scopedAuthToken}`;
};

export default createHandoffUrl;
