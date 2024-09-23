import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { EntitiesVaultDecryptRequest, EntitiesVaultDecryptResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

const entitiesVaultDecrypt = async (payload: EntitiesVaultDecryptRequest) => {
  const { authToken, field } = payload;
  const response = await requestWithoutCaseConverter<EntitiesVaultDecryptResponse>({
    method: 'POST',
    url: '/entities/vault/decrypt',
    data: {
      fields: [field],
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useEntitiesVaultDecrypt = () => {
  return useMutation({
    mutationFn: entitiesVaultDecrypt,
  });
};

export default useEntitiesVaultDecrypt;
