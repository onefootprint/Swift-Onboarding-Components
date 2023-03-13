import { UpdateProxyConfigRequest } from '@onefootprint/types';

import type { FormData } from '@/proxy-configs/proxy-configs.types';

const getDataInExpectedMode = (
  id: string,
  data: FormData,
): UpdateProxyConfigRequest => {
  const { name, method, url, accessReason, headers = [] } = data;
  return {
    id,
    name,
    method,
    url,
    accessReason,
    headers: headers
      .filter(header => !header.secret)
      .map(header => ({ name: header.name, value: header.value })),
  };
};

export default getDataInExpectedMode;
