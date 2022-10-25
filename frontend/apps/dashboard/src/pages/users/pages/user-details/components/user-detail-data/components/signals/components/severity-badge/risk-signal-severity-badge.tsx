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
      {severity === RiskSignalSeverity.Fraud && (
        <Badge variant="error">{t('fraud')}</Badge>
      )}
      {severity === RiskSignalSeverity.Warning && (
        <Badge variant="warning">{t('warning')}</Badge>
      )}
      {severity === RiskSignalSeverity.Info && (
        <Badge variant="info">{t('info')}</Badge>
      )}
    </>
  );
};

export default RiskSignalSeverityBadge;
