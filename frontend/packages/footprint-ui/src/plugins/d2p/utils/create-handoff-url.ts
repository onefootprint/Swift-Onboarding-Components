import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';

const createHandoffUrl = (scopedAuthToken: string, deviceType?: string) => {
  if (deviceType) {
    return `${HANDOFF_BASE_URL}?opener=${deviceType}#${scopedAuthToken}`;
  }
  return `${HANDOFF_BASE_URL}#${scopedAuthToken}`;
};

export default createHandoffUrl;
