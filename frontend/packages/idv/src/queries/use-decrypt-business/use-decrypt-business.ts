import { useIntl } from '@onefootprint/hooks';
import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { BusinessDIData, DecryptUserRequest } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const decryptBusiness = async ({ fields, authToken }: DecryptUserRequest, formatUtcDate: (date: Date) => string) => {
  const response = await requestWithoutCaseConverter<BusinessDIData>({
    method: 'POST',
    url: '/hosted/business/vault/decrypt',
    data: { fields },
    headers: { [AUTH_HEADER]: authToken },
  });

  const dobData = response.data['business.formation_date'] as string | undefined;
  if (dobData) {
    response.data['business.formation_date'] = formatUtcDate(new Date(dobData));
  }
  return response.data;
};

const useDecryptBusiness = () => {
  const { formatUtcDate } = useIntl();
  return useMutation((data: DecryptUserRequest) => decryptBusiness(data, formatUtcDate));
};

export default useDecryptBusiness;
