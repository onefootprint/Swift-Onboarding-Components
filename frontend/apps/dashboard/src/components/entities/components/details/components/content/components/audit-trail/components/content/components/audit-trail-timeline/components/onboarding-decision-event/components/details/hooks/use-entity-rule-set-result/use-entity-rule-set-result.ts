import request, { getErrorMessage } from '@onefootprint/request';
import type {
  GetEntityRuleSetResultRequest,
  GetEntityRuleSetResultResponse,
  Rule,
} from '@onefootprint/types';
import { RuleAction } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

type UseEntityRuleSetResultProps = {
  id: string;
};

const getRuleSetResult = async (
  payload: GetEntityRuleSetResultRequest,
  authHeaders: AuthHeaders,
) => {
  const { data: response } = await request<GetEntityRuleSetResultResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${payload.id}/rule_set_result`,
  });
  return response;
};

const useEntityRuleSetResult = ({ id }: UseEntityRuleSetResultProps) => {
  const { authHeaders } = useSession();

  const ruleSetResultQuery = useQuery(
    ['entity', id, 'rule_set_result'],
    () => getRuleSetResult({ id }, authHeaders),
    {
      select: response => {
        if (!response) {
          return {
            hasRuleResults: false,
            obConfigurationId: null,
            ruleResults: null,
          };
        }

        const formattedRuleResults = {} as Record<
          RuleAction,
          Record<string, Rule[] | boolean>
        >;
        Object.values(RuleAction).forEach(action => {
          formattedRuleResults[action] = {
            isOutcome: response.actionTriggered === action,
            triggered: [],
            notTriggered: [],
          };
        });

        const sortedRuleResults = [...response.ruleResults].sort((a, b) =>
          a.rule.createdAt > b.rule.createdAt ? 1 : -1,
        );
        sortedRuleResults.forEach(({ result, rule }) => {
          if (result) {
            (formattedRuleResults[rule.action].triggered as Rule[]).push(rule);
          } else {
            (formattedRuleResults[rule.action].notTriggered as Rule[]).push(
              rule,
            );
          }
        });
        return {
          hasRuleResults: true,
          obConfigurationId: response.obConfigurationId,
          ruleResults: formattedRuleResults,
        };
      },
    },
  );
  const { error } = ruleSetResultQuery;

  return {
    ...ruleSetResultQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
  };
};

export default useEntityRuleSetResult;
