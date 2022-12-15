import request, { RequestError } from '@onefootprint/request';
import type {
  GetRiskSignalsRequest,
  GetRiskSignalsResponse,
} from '@onefootprint/types';
import { RiskSignal } from '@onefootprint/types/src/data/risk-signal';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';
import useUserStore from 'src/hooks/use-user-store';

import { UserRiskSignals } from '../../types';
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

  return groupBySectionAndSeverity(response);
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

const useGetRiskSignals = (userId: string) => {
  const userStore = useUserStore();
  const { authHeaders } = useSession();
  const params = {};

  return useQuery<UserRiskSignals, RequestError>(
    ['riskSignals', authHeaders, userId, params],
    () => getRiskSignals({ authHeaders, userId, params }),
    {
      enabled: !!userId,
      onSuccess(data) {
        userStore.merge({
          userId,
          data: {
            riskSignals: data,
          },
        });
      },
    },
  );
};

export default useGetRiskSignals;
