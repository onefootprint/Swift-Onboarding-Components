import request from '@onefootprint/request';
import type { StytchTelemetryRequest, StytchTelemetryResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const sendTelemetryRequest = async (data: StytchTelemetryRequest, authToken: string) => {
  const response = await request<StytchTelemetryResponse>({
    method: 'POST',
    url: '/hosted/onboarding/tel',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useTelemetryRequest = (authToken: string) =>
  useMutation((data: StytchTelemetryRequest) => sendTelemetryRequest(data, authToken));

export default useTelemetryRequest;
