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
        {riskSignal.severity === RiskSignalSeverity.High && (
          <Badge variant="error">{t('high')}</Badge>
        )}
        {riskSignal.severity === RiskSignalSeverity.Medium && (
          <Badge variant="warning">{t('medium')}</Badge>
        )}
        {riskSignal.severity === RiskSignalSeverity.Low && (
          <Badge variant="info">{t('low')}</Badge>
        )}
      </td>
      <td>{riskSignal.description}</td>
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
