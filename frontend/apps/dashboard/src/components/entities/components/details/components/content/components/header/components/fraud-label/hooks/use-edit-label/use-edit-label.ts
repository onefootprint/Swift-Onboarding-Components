import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { EditLabelRequest, EditLabelResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const editLabel = async ({ id, kind }: EditLabelRequest, authHeaders: AuthHeaders) => {
  const response = await request<EditLabelResponse>({
    data: { kind },
    headers: authHeaders,
    method: 'POST',
    url: `/entities/${id}/label`,
  });
  return { data: response.data, id };
};

const useEditLabel = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const queryKey = (id: string) => ['entities', id, 'label', authHeaders];

  return useMutation(({ id, kind }: EditLabelRequest) => editLabel({ id, kind }, authHeaders), {
    onMutate: async ({ id, kind }) => {
      await queryClient.cancelQueries();
      const previousLabel = queryClient.getQueryData<EditLabelResponse>(queryKey(id));
      queryClient.setQueryData<EditLabelResponse>(queryKey(id), old => ({
        ...old,
        kind,
      }));
      return { previousLabel };
    },
    onError: (err, response, context) => {
      showErrorToast(err);
      if (context?.previousLabel) {
        queryClient.setQueryData<EditLabelResponse>(queryKey(response.id), context.previousLabel);
      }
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries(queryKey(id));
    },
  });
};

export default useEditLabel;
