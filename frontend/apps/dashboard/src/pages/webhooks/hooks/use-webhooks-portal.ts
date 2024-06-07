import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export type GetWebhooksPortalRequest = {
  authHeaders: AuthHeaders;
};

export type GetWebhooksPortalResponse = {
  url: string;
  appId: string;
  token: string;
};

const getWebhookPortal = async ({ authHeaders }: GetWebhooksPortalRequest) => {
  const { data: response } = await request<GetWebhooksPortalResponse>({
    method: 'GET',
    url: '/org/webhook_portal',
    headers: authHeaders,
  });

  return response;
};

const useWebhookPortal = () => {
  const { authHeaders } = useSession();

  return useQuery<GetWebhooksPortalResponse, RequestError>(['webhook-portal', authHeaders], () =>
    getWebhookPortal({ authHeaders }),
  );
};

export default useWebhookPortal;
