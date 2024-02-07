import request from '@onefootprint/request';
import {
  type GetRulesResponse,
  type Rule,
  RuleAction,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export const GET_QUERY_KEY = (playbookId: string) => [
  'onboarding_configs',
  playbookId,
  'rules',
];

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
    GET_QUERY_KEY(playbookId),
    () => getRules(authHeaders, playbookId),
    {
      enabled: !!playbookId,
      select: rules => {
        const formattedRules = {} as Partial<Record<RuleAction, Rule[]>>;
        const newStepUpActions = [
          RuleAction.stepUpIdentity,
          RuleAction.stepUpPoA,
          RuleAction.stepUpIdentitySsn,
        ];

        Object.values(RuleAction).forEach(action => {
          if (newStepUpActions.includes(action)) {
            return;
          }
          formattedRules[action] = [];
        });
        rules.forEach(rule => {
          const action = newStepUpActions.includes(rule.action)
            ? RuleAction.stepUp
            : rule.action;
          (formattedRules[action] as Rule[]).push(rule);
        });

        Object.keys(formattedRules).forEach(action => {
          const rulesCopy = (
            formattedRules[action as RuleAction] as Rule[]
          ).slice();
          formattedRules[action as RuleAction] = rulesCopy.sort((a, b) =>
            a.createdAt > b.createdAt ? 1 : -1,
          );
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
