import request from '@onefootprint/request';
import type {
  GetAiSummarizeRequest,
  GetAiSummarizeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const generateAiSummaryRequest = async (
  authHeaders: AuthHeaders,
  { entityId }: GetAiSummarizeRequest,
) => {
  const response = await request<GetAiSummarizeResponse>({
    method: 'POST',
    url: `/entities/${entityId}/ai_summarize`,
    headers: authHeaders,
  });
  return response.data;
};

const useGenerateAiSummaryRequest = () => {
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: (data: GetAiSummarizeRequest) =>
      generateAiSummaryRequest(authHeaders, data),
  });
};

export default useGenerateAiSummaryRequest;
