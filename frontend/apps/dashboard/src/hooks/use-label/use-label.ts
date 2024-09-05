import request from '@onefootprint/request';
import type { GetLabelResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getLabel = async (id: string, authHeaders: AuthHeaders) => {
  const response = await request<GetLabelResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${id}/label`,
  });
  return response.data;
};

const useLabel = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(['entities', id, 'label', authHeaders], () => getLabel(id, authHeaders), {
    enabled: !!id,
    select: label => label.kind,
  });
};

export default useLabel;
