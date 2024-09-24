import request from '@onefootprint/request';
import { type GetRulesResponse, type Rule, RuleAction } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export const GET_QUERY_KEY = (playbookId: string) => ['onboarding_configs', playbookId, 'rules'];

const getRules = async (authHeaders: AuthHeaders, playbookId: string) => {
  const response = await request<GetRulesResponse>({
    method: 'GET',
    url: `/org/onboarding_configs/${playbookId}/rules`,
    headers: authHeaders,
  });
  return response.data;
};

const useRules = (playbookId: string = '') => {
  const { authHeaders } = useSession();

  return useQuery({
    queryKey: GET_QUERY_KEY(playbookId),
    queryFn: () => getRules(authHeaders, playbookId),
    enabled: !!playbookId,
    select: (rules: Rule[]) => {
      const formattedRules = {} as Record<RuleAction, Rule[]>;

      Object.values(RuleAction).forEach(action => {
        formattedRules[action] = [];
      });
      rules.forEach(rule => {
        formattedRules[rule.action].push(rule);
      });

      Object.keys(formattedRules).forEach(action => {
        const rulesCopy = formattedRules[action as RuleAction].slice();
        formattedRules[action as RuleAction] = rulesCopy.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
      });

      return { hasRules: !!rules.length, data: formattedRules };
    },
  });
};

export default useRules;
