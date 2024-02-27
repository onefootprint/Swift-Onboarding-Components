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
  entityId: string;
  ruleSetResultId?: string;
};

const getRuleSetResult = async (
  payload: GetEntityRuleSetResultRequest,
  authHeaders: AuthHeaders,
) => {
  const { data: response } = await request<GetEntityRuleSetResultResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${payload.entityId}/rule_set_result/${payload.ruleSetResultId}`,
  });
  return response;
};

const useEntityRuleSetResult = ({
  entityId,
  ruleSetResultId,
}: UseEntityRuleSetResultProps) => {
  const { authHeaders } = useSession();

  const ruleSetResultQuery = useQuery(
    ['entity', entityId, 'rule_set_result', ruleSetResultId],
    () => getRuleSetResult({ entityId, ruleSetResultId }, authHeaders),
    {
      enabled: !!ruleSetResultId,
      select: response => {
        if (!response) {
          return {
            actionTriggered: null,
            obConfigurationId: null,
            ruleResults: null,
          };
        }

        const formattedRuleResults = {} as Record<
          RuleAction,
          Record<string, Rule[]>
        >;

        Object.values(RuleAction).forEach(action => {
          formattedRuleResults[action] = {
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
          actionTriggered: response.actionTriggered,
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
