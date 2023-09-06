import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronRight24, IcoInfo16 } from '@onefootprint/icons';
import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalSeverity } from '@onefootprint/types';
import { Badge, Box, Tooltip } from '@onefootprint/ui';
import React from 'react';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
  const { t } = useTranslation('pages.entity.risk-signals.severity');

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
      <td>
        <Box sx={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
          {riskSignal.note}
          <Tooltip text={riskSignal.description}>
            <IcoInfo16 />
          </Tooltip>
        </Box>
      </td>
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

export default Row;
