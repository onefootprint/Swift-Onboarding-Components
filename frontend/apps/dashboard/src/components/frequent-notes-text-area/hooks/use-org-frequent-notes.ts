import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetOrgFrequentNotesResponse, OrgFrequentNoteKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getOrgFrequentNotes = async (kind: OrgFrequentNoteKind, authHeaders: AuthHeaders) => {
  const response = await request<GetOrgFrequentNotesResponse>({
    method: 'GET',
    url: `/org/frequent_notes`,
    params: {
      kind,
    },
    headers: authHeaders,
  });

  return response.data;
};

export const getOrgFrequentNotesQueryKey = (kind?: OrgFrequentNoteKind, authHeaders?: AuthHeaders) => {
  const k = ['org', 'frequent_notes'] as (string | AuthHeaders)[];
  if (kind) {
    k.push(kind);
    if (authHeaders) {
      k.push(authHeaders);
    }
  }
  return k;
};

const useOrgFrequentNotes = (kind: OrgFrequentNoteKind) => {
  const { authHeaders } = useSession();

  return useQuery<GetOrgFrequentNotesResponse, RequestError>(getOrgFrequentNotesQueryKey(kind, authHeaders), () =>
    getOrgFrequentNotes(kind, authHeaders),
  );
};

export default useOrgFrequentNotes;
