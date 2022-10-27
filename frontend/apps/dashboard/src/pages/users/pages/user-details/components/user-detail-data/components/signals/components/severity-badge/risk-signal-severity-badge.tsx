import { useTranslation } from '@onefootprint/hooks';
import { RiskSignalSeverity } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import React from 'react';

export type RiskSignalSeverityBadgeProps = {
  severity: RiskSignalSeverity;
};

const RiskSignalSeverityBadge = ({
  severity,
}: RiskSignalSeverityBadgeProps) => {
  const { t } = useTranslation('pages.user-details.signals.severity');

  return (
    <>
      {severity === RiskSignalSeverity.High && (
        <Badge variant="error">{t('high')}</Badge>
      )}
      {severity === RiskSignalSeverity.Medium && (
        <Badge variant="warning">{t('medium')}</Badge>
      )}
      {severity === RiskSignalSeverity.Low && (
        <Badge variant="info">{t('low')}</Badge>
      )}
    </>
  );
};

export default RiskSignalSeverityBadge;
