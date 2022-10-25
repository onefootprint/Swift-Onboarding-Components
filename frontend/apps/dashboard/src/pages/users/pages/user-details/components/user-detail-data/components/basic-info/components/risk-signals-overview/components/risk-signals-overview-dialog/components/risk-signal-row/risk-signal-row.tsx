import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronRight24 } from '@onefootprint/icons';
import { RiskSignal, RiskSignalSeverity } from '@onefootprint/types';
import { Badge, Box } from '@onefootprint/ui';
import React from 'react';

type RiskSignalRowProps = {
  riskSignal: RiskSignal;
};

const RiskSignalRow = ({ riskSignal }: RiskSignalRowProps) => {
  const { t } = useTranslation('pages.user-details.signals.severity');

  return (
    <>
      <td>
        {riskSignal.severity === RiskSignalSeverity.Fraud && (
          <Badge variant="error">{t('fraud')}</Badge>
        )}
        {riskSignal.severity === RiskSignalSeverity.Warning && (
          <Badge variant="warning">{t('warning')}</Badge>
        )}
        {riskSignal.severity === RiskSignalSeverity.Info && (
          <Badge variant="info">{t('info')}</Badge>
        )}
      </td>
      <td>{riskSignal.note}</td>
      <td>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IcoChevronRight24 />
        </Box>
      </td>
    </>
  );
};

export default RiskSignalRow;
