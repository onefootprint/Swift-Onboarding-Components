import { getErrorMessage } from '@onefootprint/request';
import React from 'react';

import useEntityId from '@/entity/hooks/use-entity-id';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useRiskSignalsOverview from './hooks/use-risk-signals-overview';
import type { RiskSignalsSummary } from './risk-signals-overview.types';

export type RiskSignalsOverviewProps = {
  type: keyof RiskSignalsSummary;
};

const RiskSignalsOverview = ({ type }: RiskSignalsOverviewProps) => {
  const id = useEntityId();
  const { data, isLoading, error } = useRiskSignalsOverview(id);

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <Error>{getErrorMessage(error)}</Error>;
  }
  if (data) {
    const { high, medium, low } = data[type];
    return <Content high={high} medium={medium} low={low} />;
  }
  return null;
};

export default RiskSignalsOverview;
