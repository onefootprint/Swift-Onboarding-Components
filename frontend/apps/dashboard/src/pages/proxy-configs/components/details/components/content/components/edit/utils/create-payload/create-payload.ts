import type { UpdateProxyConfigRequest } from '@onefootprint/types';
import type { FormData } from 'src/pages/proxy-configs/proxy-configs.types';

const getDataInExpectedMode = (
  id: string,
  data: FormData,
): UpdateProxyConfigRequest => {
  const {
    name,
    method,
    url,
    accessReason,
    headers = [],
    ingressSettings,
  } = data;
  // TODO how do we differentiate between wipe ingress settings and update theM?
  return {
    id,
    name,
    method,
    url,
    accessReason,
    headers: headers
      .filter(header => !header.secret)
      .map(header => ({ name: header.name, value: header.value })),
    ingressSettings:
      ingressSettings.contentType !== 'none'
        ? {
            contentType: ingressSettings.contentType,
            rules: ingressSettings.rules,
          }
        : undefined,
  };
};

export default getDataInExpectedMode;
