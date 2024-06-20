import request from '@onefootprint/request';
import type { GetEntityRiskSignalsRequest, GetEntityRiskSignalsResponse } from '@onefootprint/types';
import type { RiskSignal } from '@onefootprint/types/src/data/risk-signal';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import type { RiskSignalsSummary } from '../risk-signals-overview.types';
import groupBySection from './utils/group-by-section';
import groupBySeverity from './utils/group-by-severity';

const getRiskSignals = async ({ id, seqno }: GetEntityRiskSignalsRequest, authHeaders: AuthHeaders) => {
  const { data: response } = await request<GetEntityRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${id}/risk_signals`,
    params: { seqno },
  });

  return groupBySectionAndSeverity(response);
};

export const groupBySectionAndSeverity = (signals: RiskSignal[]): RiskSignalsSummary => {
  const sections = groupBySection(signals);
  return {
    basic: groupBySeverity(sections.basic),
    identity: groupBySeverity(sections.identity),
    address: groupBySeverity(sections.address),
    document: groupBySeverity(sections.document),
  };
};

const useRiskSignalsOverview = (id: string, seqno?: string | undefined) => {
  const { authHeaders } = useSession();

  return useQuery(['entity', id, 'risk-signals-overview', seqno], () => getRiskSignals({ id, seqno }, authHeaders), {
    enabled: !!id,
  });
};

export default useRiskSignalsOverview;
