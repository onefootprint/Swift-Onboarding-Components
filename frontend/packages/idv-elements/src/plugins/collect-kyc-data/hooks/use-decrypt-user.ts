import { useIntl } from '@onefootprint/hooks';
import { requestWithoutCaseConverter } from '@onefootprint/request';
import { DecryptUserRequest, DecryptUserResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../config/constants';

const decryptUser = async (
  { fields, authToken }: DecryptUserRequest,
  formatUtcDate: (date: Date) => string,
) => {
  const response = await requestWithoutCaseConverter<DecryptUserResponse>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: {
      fields,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  if (response.data['id.dob']) {
    response.data['id.dob'] = formatUtcDate(new Date(response.data['id.dob']));
  }
  return response.data;
};

const useDecryptUser = () => {
  const { formatUtcDate } = useIntl();
  return useMutation((data: DecryptUserRequest) =>
    decryptUser(data, formatUtcDate),
  );
};

export default useDecryptUser;
