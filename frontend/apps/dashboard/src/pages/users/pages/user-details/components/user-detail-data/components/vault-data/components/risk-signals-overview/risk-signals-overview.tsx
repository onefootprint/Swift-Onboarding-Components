import { getErrorMessage } from '@onefootprint/request';
import { RiskSignal } from '@onefootprint/types';
import React from 'react';

import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';

export type RiskSignalsOverviewProps = {
  data?: {
    high: RiskSignal[];
    low: RiskSignal[];
    medium: RiskSignal[];
  };
  error?: unknown;
  isLoading?: boolean;
};

const RiskSignalsOverview = ({
  data,
  error,
  isLoading,
}: RiskSignalsOverviewProps) => {
  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <Error>{getErrorMessage(error)}</Error>;
  }
  if (data) {
    return <Data high={data.high} medium={data.medium} low={data.low} />;
  }
  return null;
};

export default RiskSignalsOverview;
