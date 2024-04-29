import request, { getErrorMessage } from '@onefootprint/request';
import type {
  GetEntityRuleSetResultRequest,
  GetEntityRuleSetResultResponse,
  Rule,
} from '@onefootprint/types';
import { OnboardingDecisionRuleAction, RuleAction } from '@onefootprint/types';
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
            isPresent: [],
            isNotPresent: [],
          };
        });

        const sortedRuleResults = [...response.ruleResults].sort((a, b) =>
          a.rule.createdAt > b.rule.createdAt ? 1 : -1,
        );
        sortedRuleResults.forEach(({ result, rule }) => {
          if (result) {
            (formattedRuleResults[rule.action].isPresent as Rule[]).push(rule);
          } else {
            (formattedRuleResults[rule.action].isNotPresent as Rule[]).push(
              rule,
            );
          }
        });

        return {
          // On the backend, if there's a non-null API response, a null actionTriggered is an implied Pass
          actionTriggered: response.actionTriggered
            ? response.actionTriggered
            : OnboardingDecisionRuleAction.pass,
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
