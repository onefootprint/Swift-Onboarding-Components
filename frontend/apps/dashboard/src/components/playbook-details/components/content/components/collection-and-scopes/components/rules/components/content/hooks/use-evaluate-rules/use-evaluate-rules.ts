import request from '@onefootprint/request';
import type { EvaluateRulesRequest, EvaluateRulesResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const evaluateRules = async ({ playbookId, fields }: EvaluateRulesRequest, authHeaders: AuthHeaders) =>
  request<EvaluateRulesResponse>({
    method: 'POST',
    url: `/org/onboarding_configs/${playbookId}/rules/evaluate`,
    data: {
      ...fields,
    },
    headers: authHeaders,
  });

const useEvaluateRules = () => {
  const { authHeaders } = useSession();

  return useMutation(({ playbookId, fields }: EvaluateRulesRequest) =>
    evaluateRules({ playbookId, fields }, authHeaders),
  );
};

export default useEvaluateRules;
