import { requestWithoutCaseConverter } from '@onefootprint/request';
import { type EditRequest, type EditResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useEntityId from '@/entity/hooks/use-entity-id';

const edit = async ({ entityId, fields }: EditRequest, authHeaders: AuthHeaders) => {
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
  const entityId = useEntityId();
  const queryClient = useQueryClient();

  return useMutation((data: EditRequest) => edit(data, authHeaders), {
    onSuccess: () => {
      queryClient.invalidateQueries(['entity', entityId, 'timeline', authHeaders]);
    },
  });
};

export default useEdit;
