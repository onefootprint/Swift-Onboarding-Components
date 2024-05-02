import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type {
  CopyPlaybookRequest,
  CopyPlaybookResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { type AuthHeaders } from 'src/hooks/use-session';

const copyPlaybook = async (
  authHeaders: AuthHeaders,
  { playbookId, name, isLive }: CopyPlaybookRequest,
) => {
  const response = await request<CopyPlaybookResponse>({
    method: 'POST',
    url: `/org/onboarding_configs/${playbookId}/copy`,
    headers: authHeaders,
    data: {
      name,
      isLive,
    },
  });

  return response.data;
};

const useCopyPlaybook = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const showErrorToast = useRequestErrorToast();

  return useMutation({
    mutationFn: (data: CopyPlaybookRequest) => copyPlaybook(authHeaders, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: showErrorToast,
  });
};

export default useCopyPlaybook;
