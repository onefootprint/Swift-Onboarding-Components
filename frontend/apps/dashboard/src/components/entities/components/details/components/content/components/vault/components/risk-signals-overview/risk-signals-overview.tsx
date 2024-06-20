import React from 'react';
import { ErrorComponent } from 'src/components';

import useEntityId from '@/entity/hooks/use-entity-id';

import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import Content from './components/content';
import Loading from './components/loading';
import useRiskSignalsOverview from './hooks/use-risk-signals-overview';
import type { RiskSignalsSummary } from './risk-signals-overview.types';

export type RiskSignalsOverviewProps = {
  type: keyof RiskSignalsSummary;
};

const RiskSignalsOverview = ({ type }: RiskSignalsOverviewProps) => {
  const id = useEntityId();
  const seqno = useEntitySeqno();
  const { data, isLoading, error } = useRiskSignalsOverview(id, seqno);

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <ErrorComponent error={error} />;
  }
  if (data) {
    const { high, medium, low } = data[type];
    return <Content high={high} medium={medium} low={low} />;
  }
  return null;
};

export default RiskSignalsOverview;
