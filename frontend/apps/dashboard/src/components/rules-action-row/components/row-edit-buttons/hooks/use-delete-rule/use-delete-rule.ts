import { requestWithoutCaseConverter } from '@onefootprint/request';
import type {
  DeleteRuleRequest,
  DeleteRuleResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GET_QUERY_KEY } from 'src/components/playbook-details/components/content/components/collection-and-scopes/components/rules/hooks/use-rules';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const deleteRule = async (
  { playbookId, ruleId }: DeleteRuleRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await requestWithoutCaseConverter<DeleteRuleResponse>({
    method: 'DELETE',
    url: `/org/onboarding_configs/${playbookId}/rules/${ruleId}`,
    headers: authHeaders,
  });
  return { playbookId, data: response };
};

const useDeleteRule = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(
    ({ playbookId, ruleId }: DeleteRuleRequest) =>
      deleteRule({ playbookId, ruleId }, authHeaders),
    {
      onSuccess: ({ playbookId }) => {
        queryClient.invalidateQueries(GET_QUERY_KEY(playbookId));
      },
    },
  );
};

export default useDeleteRule;
