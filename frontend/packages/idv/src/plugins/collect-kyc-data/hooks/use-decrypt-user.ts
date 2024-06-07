import { useIntl } from '@onefootprint/hooks';
import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { DecryptUserRequest, DecryptUserResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const decryptUser = async ({ fields, authToken }: DecryptUserRequest, formatUtcDate: (date: Date) => string) => {
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
  const dobData = response.data['id.dob'] as string | undefined;
  if (dobData) {
    response.data['id.dob'] = formatUtcDate(new Date(dobData));
  }
  return response.data;
};

const useDecryptUser = () => {
  const { formatUtcDate } = useIntl();
  return useMutation((data: DecryptUserRequest) => decryptUser(data, formatUtcDate));
};

export default useDecryptUser;
