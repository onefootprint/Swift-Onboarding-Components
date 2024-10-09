import request from '@onefootprint/request';
import type { CreateOrgTagRequest, CreateOrgTagResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const create = async ({ kind, text }: CreateOrgTagRequest, authHeaders: AuthHeaders) => {
  const response = await request<CreateOrgTagResponse>({
    data: { kind, tag: text },
    headers: authHeaders,
    method: 'POST',
    url: '/org/tags',
  });

  return response.data;
};

const useOrgCreateTag = () => {
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: ({ kind, text }: CreateOrgTagRequest) => create({ kind, text }, authHeaders),
  });
};

export default useOrgCreateTag;
