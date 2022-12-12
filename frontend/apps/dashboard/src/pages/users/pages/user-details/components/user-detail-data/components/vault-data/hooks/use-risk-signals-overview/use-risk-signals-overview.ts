import request from '@onefootprint/request';
import type {
  GetRiskSignalsRequest,
  GetRiskSignalsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

import useUserId from '../../../../../../hooks/use-user-id';
import groupBySection from './utils/group-by-section';
import groupBySeverity from './utils/group-by-severity';

const getRiskSignals = async ({
  authHeaders,
  userId,
  params,
}: GetRiskSignalsRequest) => {
  const { data: response } = await request<GetRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}/risk_signals`,
    params,
  });
  return response;
};

export const groupBySectionAndSeverity = (
  riskSignalsResponse: GetRiskSignalsResponse,
) => {
  const sections = groupBySection(riskSignalsResponse);
  return {
    basic: groupBySeverity(sections.basic),
    identity: groupBySeverity(sections.identity),
    address: groupBySeverity(sections.address),
  };
};

const useRiskSignalsOverview = () => {
  const { authHeaders } = useSession();
  const userId = useUserId();
  const params = {};

  return useQuery(
    ['riskSignals', authHeaders, userId, params],
    () => getRiskSignals({ authHeaders, userId, params }),
    {
      enabled: !!userId,
      select: groupBySectionAndSeverity,
    },
  );
};

export default useRiskSignalsOverview;
