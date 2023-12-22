import { requestWithoutCaseConverter } from '@onefootprint/request';
import { type AddRuleRequest, type AddRuleResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import { GET_QUERY_KEY } from '../use-rules/use-rules';

const addRule = async (
  { playbookId, fields }: AddRuleRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<AddRuleResponse>({
    method: 'POST',
    url: `/org/onboarding_configs/${playbookId}/rules`,
    data: {
      ...fields,
    },
    headers: authHeaders,
  });
  return { data: response.data, playbookId };
};

const useAddRule = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(
    ({ playbookId, fields }: AddRuleRequest) =>
      addRule({ playbookId, fields }, authHeaders),
    {
      onSuccess: ({ playbookId }) => {
        queryClient.invalidateQueries(GET_QUERY_KEY(playbookId));
      },
    },
  );
};

export default useAddRule;
