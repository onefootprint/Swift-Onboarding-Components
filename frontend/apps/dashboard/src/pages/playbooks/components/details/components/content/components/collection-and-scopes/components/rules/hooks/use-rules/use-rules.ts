import request from '@onefootprint/request';
import type { GetRulesResponse, Rule } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

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

  const rulesQuery = useQuery(
    ['onboarding_configs', playbookId, 'rules'],
    () => getRules(authHeaders, playbookId),
    {
      enabled: !!playbookId,
      select: rules => {
        const formattedRules = {} as Record<string, Rule[]>;
        rules.forEach(rule => {
          if (rule.action in formattedRules) {
            formattedRules[rule.action].push(rule);
          } else {
            formattedRules[rule.action] = [rule];
          }
        });
        return { hasRules: !!rules.length, data: formattedRules };
      },
    },
  );
  const { error, data } = rulesQuery;

  return {
    ...rulesQuery,
    error: error ?? undefined,
    response: data,
  };
};

export default useRules;
