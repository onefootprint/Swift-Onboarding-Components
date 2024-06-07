import request from '@onefootprint/request';
import type { CreateOrgFrequentNoteRequest, CreateOrgFrequentNoteResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import { getOrgFrequentNotesQueryKey } from './use-org-frequent-notes';

const createOrgFrequentNote = async (data: CreateOrgFrequentNoteRequest, authHeaders: AuthHeaders) => {
  const response = await request<CreateOrgFrequentNoteResponse>({
    method: 'POST',
    url: `/org/frequent_notes`,
    data,
    headers: authHeaders,
  });

  return response.data;
};

const useCreateOrgFrequentNote = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation((req: CreateOrgFrequentNoteRequest) => createOrgFrequentNote(req, authHeaders), {
    onSuccess: (resp: CreateOrgFrequentNoteResponse) => {
      queryClient.invalidateQueries(getOrgFrequentNotesQueryKey(resp.kind, authHeaders));
    },
  });
};

export default useCreateOrgFrequentNote;
