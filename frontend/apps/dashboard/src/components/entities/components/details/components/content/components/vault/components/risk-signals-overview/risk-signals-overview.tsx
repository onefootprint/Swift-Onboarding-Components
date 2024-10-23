import { ErrorComponent } from 'src/components';

import useEntityId from '@/entity/hooks/use-entity-id';

import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import type { RiskSignalsSummary } from '@onefootprint/types';
import useRiskSignalsOverview from 'src/components/entities/hooks/use-risk-signals-overview';
import Content from './components/content';
import Loading from './components/loading';

export type RiskSignalsOverviewProps = {
  type: keyof RiskSignalsSummary;
};

const RiskSignalsOverview = ({ type }: RiskSignalsOverviewProps) => {
  const id = useEntityId();
  const seqno = useEntitySeqno();
  const { data, isPending, error } = useRiskSignalsOverview(id, seqno);

  if (isPending) {
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
