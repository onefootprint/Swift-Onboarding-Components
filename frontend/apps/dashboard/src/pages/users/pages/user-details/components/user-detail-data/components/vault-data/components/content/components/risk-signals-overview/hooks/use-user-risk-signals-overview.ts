import request from '@onefootprint/request';
import type { GetRiskSignalsResponse } from '@onefootprint/types';
import { RiskSignal } from '@onefootprint/types/src/data/risk-signal';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import { RiskSignalsSummary } from '../risk-signals-overview.types';
import groupBySection from './utils/group-by-section';
import groupBySeverity from './utils/group-by-severity';

const getRiskSignalsRequest = async (
  userId: string,
  authHeaders: AuthHeaders,
) => {
  const { data: response } = await request<GetRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}/risk_signals`,
  });
  return groupBySectionAndSeverity(response);
};

export const groupBySectionAndSeverity = (
  signals: RiskSignal[],
): RiskSignalsSummary => {
  const sections = groupBySection(signals);
  return {
    basic: groupBySeverity(sections.basic),
    identity: groupBySeverity(sections.identity),
    address: groupBySeverity(sections.address),
    document: groupBySeverity(sections.document),
  };
};

const useUserRiskSignalsOverview = (userId: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['user', 'riskSignalsOverview', authHeaders, userId],
    () => getRiskSignalsRequest(userId, authHeaders),
    { enabled: !!userId },
  );
};

export default useUserRiskSignalsOverview;
