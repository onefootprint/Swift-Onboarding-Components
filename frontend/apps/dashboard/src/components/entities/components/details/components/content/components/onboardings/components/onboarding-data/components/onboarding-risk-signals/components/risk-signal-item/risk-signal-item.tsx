import useRiskSignalsFilters from '@/entities/components/details/hooks/use-risk-signals-filters';
import type { RiskSignal } from '@onefootprint/request-types/dashboard';
import { Divider } from '@onefootprint/ui';
import { cva } from 'class-variance-authority';
import useRiskSignalSeverityText from './hooks/use-risk-signal-severity-text';
import isSentilinkSignal from './utils/is-sentilink-signal';

type RiskSignalItemProps = {
  riskSignal: RiskSignal;
};

const RiskSignalItem = ({ riskSignal }: RiskSignalItemProps) => {
  const riskSignalSeverityT = useRiskSignalSeverityText();
  const filters = useRiskSignalsFilters();
  const { id, reasonCode, severity } = riskSignal;

  // This will open StandardDetails or SentilinkDetails
  // TODO: move both components and isSentilinkSignal here after RiskSignalsList is removed
  const handleRowClick = () => {
    if (isSentilinkSignal(riskSignal)) {
      filters.push({ risk_signal_id: id, is_sentilink: 'true' });
    } else {
      filters.push({ risk_signal_id: id });
    }
  };

  const getSeverityColor = () => {
    if (severity === 'high') return 'error';
    if (severity === 'medium') return 'warning';
    if (severity === 'low') return 'info';
    if (severity === 'info') return 'neutral';
  };

  return (
    <button className={riskSignalItemItem()} onClick={handleRowClick} type="button">
      <span className="text-snippet-2 text-secondary">{reasonCode}</span>
      <Divider variant="secondary" marginBottom={2} />
      <span className={`text-caption-1 text-${getSeverityColor()}`}>{riskSignalSeverityT(severity)}</span>
    </button>
  );
};

const riskSignalItemItem = cva([
  'relative flex items-end gap-2 py-1 z-10',
  'hover:after:content-[""]',
  'hover:after:absolute hover:after:top-0 hover:after:left-[-12px]',
  'hover:after:w-[calc(100%+24px)] hover:after:h-full',
  'hover:after:bg-secondary hover:after:rounded-[2px] hover:after:-z-10',
]);

export default RiskSignalItem;
