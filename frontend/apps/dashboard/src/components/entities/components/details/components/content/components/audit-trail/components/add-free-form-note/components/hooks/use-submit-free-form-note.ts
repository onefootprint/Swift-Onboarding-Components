import request from '@onefootprint/request';
import type { SubmitFreeFormNoteRequest, SubmitFreeFormNoteResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const submitFreeFormNote = async (
  authHeaders: AuthHeaders,
  { entityId, isPinned, note }: SubmitFreeFormNoteRequest,
) => {
  const data = { isPinned, note };
  const response = await request<SubmitFreeFormNoteResponse>({
    method: 'POST',
    url: `/entities/${entityId}/annotations`,
    data,
    headers: authHeaders,
  });

  return response.data;
};

const useSubmitFreeFormNote = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitFreeFormNoteRequest) => submitFreeFormNote(authHeaders, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['entity'] });
    },
  });
};

export default useSubmitFreeFormNote;
