import { getErrorMessage } from '@onefootprint/request';
import React from 'react';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import useUserRiskSignalsOverview from './hooks/use-user-risk-signals-overview';
import type { RiskSignalsSummary } from './risk-signals-overview.types';

export type RiskSignalsOverviewProps = {
  type: keyof RiskSignalsSummary;
};

const RiskSignalsOverview = ({ type }: RiskSignalsOverviewProps) => {
  const userId = useUserId();
  const { data, isLoading, error } = useUserRiskSignalsOverview(userId);

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <Error>{getErrorMessage(error)}</Error>;
  }
  if (data) {
    const { high, medium, low } = data[type];
    return <Data high={high} medium={medium} low={low} />;
  }
  return null;
};

export default RiskSignalsOverview;
