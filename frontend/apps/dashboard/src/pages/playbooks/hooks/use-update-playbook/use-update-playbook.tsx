import { patchOrgPlaybooksById } from '@onefootprint/axios/dashboard';
import type { PatchOrgPlaybooksByIdData } from '@onefootprint/request-types/dashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useUpdatePlaybook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatchOrgPlaybooksByIdData) => {
      return patchOrgPlaybooksById(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export default useUpdatePlaybook;
