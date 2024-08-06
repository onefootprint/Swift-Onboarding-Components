import { RiskSignalSeverity } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type SeverityBadgeProps = {
  severity: RiskSignalSeverity;
};

const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.severity',
  });

  return (
    <>
      {severity === RiskSignalSeverity.High && <Badge variant="error">{t('high')}</Badge>}
      {severity === RiskSignalSeverity.Medium && <Badge variant="warning">{t('medium')}</Badge>}
      {severity === RiskSignalSeverity.Low && <Badge variant="info">{t('low')}</Badge>}
      {severity === RiskSignalSeverity.Info && <Badge variant="neutral">{t('info')}</Badge>}
    </>
  );
};

export default SeverityBadge;
