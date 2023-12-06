import request from '@onefootprint/request';
import type { TriggerLinkRequest } from '@onefootprint/types/src/api';
import type { TriggerLinkResponse } from '@onefootprint/types/src/api/trigger-link';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const submitTriggerLink = async (
  authHeaders: AuthHeaders,
  { entityId, triggerId }: TriggerLinkRequest,
) => {
  const response = await request<TriggerLinkResponse>({
    method: 'POST',
    url: `/entities/${entityId}/triggers/${triggerId}/link`,
    headers: authHeaders,
  });
  return response.data;
};

const useGenerateTriggerLink = () => {
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: (data: TriggerLinkRequest) =>
      submitTriggerLink(authHeaders, data),
  });
};

export default useGenerateTriggerLink;
