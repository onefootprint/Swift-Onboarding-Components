import { requestWithoutCaseConverter } from '@onefootprint/request';
import { type EditRequest, type EditResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const edit = async (
  { entityId, fields }: EditRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<EditResponse>({
    method: 'PATCH',
    url: `/entities/${entityId}/vault`,
    data: {
      ...fields,
    },
    headers: authHeaders,
  });
  return response.data;
};

const useEdit = () => {
  const { authHeaders } = useSession();
  return useMutation((data: EditRequest) => edit(data, authHeaders));
};

export default useEdit;
