import request from '@onefootprint/request';
import { AUTH_HEADER, IdDI } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type PayloadPartial = 'authToken';
type BasePayload = Pick<Payload, PayloadPartial>;
type RestOfPayload = Omit<Payload, PayloadPartial>;
type Payload = {
  [IdDI.phoneNumber]: string;
  authToken?: string;
};

const requestFn = async ({ authToken, ...rest }: Payload) => {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }

  const response = await request<{ token: string }>({
    url: '/hosted/identify/kba',
    headers,
    method: 'POST',
    data: rest,
  });

  return response.data;
};

const useIdentifyKba = (basePayload?: BasePayload) =>
  useMutation({
    mutationFn: (restOfPayload: Partial<BasePayload> & RestOfPayload) =>
      requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useIdentifyKba;
