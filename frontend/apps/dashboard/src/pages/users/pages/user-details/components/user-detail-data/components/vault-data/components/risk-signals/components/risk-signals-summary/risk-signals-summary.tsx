import { getErrorMessage, RequestError } from '@onefootprint/request';
import React from 'react';
import { RiskSignalSeverityGrouping } from 'src/hooks/use-user';

import Data from '../data';
import Error from '../error';
import Loading from '../loading';

export type RiskSignalsSummaryProps = {
  isLoading?: boolean;
  error?: unknown | RequestError;
  data?: RiskSignalSeverityGrouping;
};

const RiskSignalsSummary = ({
  isLoading,
  error,
  data,
}: RiskSignalsSummaryProps) => {
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

export default RiskSignalsSummary;
