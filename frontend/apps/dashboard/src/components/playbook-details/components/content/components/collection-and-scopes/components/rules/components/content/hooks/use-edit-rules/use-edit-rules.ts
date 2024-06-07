import request from '@onefootprint/request';
import { type EditRulesRequest, type EditRulesResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { GET_QUERY_KEY } from 'src/components/playbook-details/components/content/components/collection-and-scopes/components/rules/hooks/use-rules';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const editRules = async ({ playbookId, fields }: EditRulesRequest, authHeaders: AuthHeaders) => {
  const response = await request<EditRulesResponse>({
    method: 'PATCH',
    url: `/org/onboarding_configs/${playbookId}/rules`,
    data: {
      ...fields,
    },
    headers: authHeaders,
  });
  return { data: response.data, playbookId };
};

const useEditRules = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(({ playbookId, fields }: EditRulesRequest) => editRules({ playbookId, fields }, authHeaders), {
    onSuccess: ({ playbookId }) => {
      // Updates both the playbook (for the ruleSet value) and playbook rules
      queryClient.invalidateQueries(['onboarding_configs', playbookId]);
    },
  });
};

export default useEditRules;
