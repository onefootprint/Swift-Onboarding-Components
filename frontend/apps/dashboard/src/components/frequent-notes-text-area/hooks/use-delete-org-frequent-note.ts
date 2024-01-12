import request from '@onefootprint/request';
import type {} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import { getOrgFrequentNotesQueryKey } from './use-org-frequent-notes';

const deleteOrgFrequentNote = async (id: string, authHeaders: AuthHeaders) => {
  await request({
    method: 'DELETE',
    url: `/org/frequent_notes/${id}`,
    headers: authHeaders,
  });
};

const useDeleteOrgFrequentNote = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation((id: string) => deleteOrgFrequentNote(id, authHeaders), {
    onSuccess: () => {
      queryClient.invalidateQueries(getOrgFrequentNotesQueryKey());
    },
  });
};

export default useDeleteOrgFrequentNote;
