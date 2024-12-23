import type { SignalSeverity } from '@onefootprint/request-types/dashboard';
import { Badge } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type SeverityBadgeProps = {
  severity: SignalSeverity;
};

const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.risk-signals.severity',
  });

  return (
    <>
      {severity === 'high' && <Badge variant="error">{t('high')}</Badge>}
      {severity === 'medium' && <Badge variant="warning">{t('medium')}</Badge>}
      {severity === 'low' && <Badge variant="info">{t('low')}</Badge>}
      {severity === 'info' && <Badge variant="neutral">{t('info')}</Badge>}
    </>
  );
};

export default SeverityBadge;
