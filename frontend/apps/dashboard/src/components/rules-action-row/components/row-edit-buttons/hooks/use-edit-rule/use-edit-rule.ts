import { requestWithoutCaseConverter } from '@onefootprint/request';
import {
  type EditRuleRequest,
  type EditRuleResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GET_QUERY_KEY } from 'src/components/playbook-details-drawer/components/content/components/collection-and-scopes/components/rules/hooks/use-rules';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const editRule = async (
  { playbookId, ruleId, fields }: EditRuleRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<EditRuleResponse>({
    method: 'PATCH',
    url: `/org/onboarding_configs/${playbookId}/rules/${ruleId}`,
    data: {
      ...fields,
    },
    headers: authHeaders,
  });
  return { data: response.data, playbookId };
};

const useEditRule = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(
    ({ playbookId, ruleId, fields }: EditRuleRequest) =>
      editRule({ playbookId, ruleId, fields }, authHeaders),
    {
      onSuccess: ({ playbookId }) => {
        queryClient.invalidateQueries(GET_QUERY_KEY(playbookId));
      },
    },
  );
};

export default useEditRule;
