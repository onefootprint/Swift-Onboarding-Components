import request, { RequestError } from '@onefootprint/request';
import type {
  GetRiskSignalsRequest,
  GetRiskSignalsResponse,
} from '@onefootprint/types';
import { RiskSignal } from '@onefootprint/types/src/data/risk-signal';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

import { UserRiskSignals } from '../../user-store.types';
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
  signals: RiskSignal[],
): UserRiskSignals => {
  const sections = groupBySection(signals);
  return {
    basic: groupBySeverity(sections.basic),
    identity: groupBySeverity(sections.identity),
    address: groupBySeverity(sections.address),
  };
};

const useGetRiskSignals = (
  userId?: string,
  options?: {
    onSuccess?: (data: UserRiskSignals) => void;
    onError?: (error: RequestError) => void;
  },
) => {
  const { authHeaders } = useSession();
  const params = {};

  return useQuery(
    ['riskSignals', authHeaders, userId, params],
    () => getRiskSignals({ authHeaders, userId: userId ?? '', params }),
    {
      select: groupBySectionAndSeverity,
      enabled: !!userId,
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    },
  );
};

export default useGetRiskSignals;
