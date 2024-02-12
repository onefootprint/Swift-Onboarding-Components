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
            hasRuleResults: false,
            obConfigurationId: null,
            ruleResults: null,
          };
        }

        const formattedRuleResults = {} as Record<
          RuleAction,
          Record<string, Rule[] | boolean>
        >;
        const newStepUpActions = [
          RuleAction.stepUpIdentity,
          RuleAction.stepUpPoA,
          RuleAction.stepUpIdentitySsn,
        ];

        Object.values(RuleAction).forEach(action => {
          if (newStepUpActions.includes(action)) {
            return;
          }

          let isOutcome = response.actionTriggered === action;
          if (action === RuleAction.stepUp && !isOutcome) {
            isOutcome = newStepUpActions.includes(action);
          }

          formattedRuleResults[action] = {
            isOutcome,
            triggered: [],
            notTriggered: [],
          };
        });

        const sortedRuleResults = [...response.ruleResults].sort((a, b) =>
          a.rule.createdAt > b.rule.createdAt ? 1 : -1,
        );
        sortedRuleResults.forEach(({ result, rule }) => {
          const action = newStepUpActions.includes(rule.action)
            ? RuleAction.stepUp
            : rule.action;
          if (result) {
            (formattedRuleResults[action].triggered as Rule[]).push(rule);
          } else {
            (formattedRuleResults[action].notTriggered as Rule[]).push(rule);
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
