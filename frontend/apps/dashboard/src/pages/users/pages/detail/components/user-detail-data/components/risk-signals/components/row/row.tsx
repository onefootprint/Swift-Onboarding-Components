import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import type { RiskSignal } from '@onefootprint/types';
import { Badge, Box, Tooltip } from '@onefootprint/ui';
import React from 'react';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
  const { t } = useTranslation('pages.user-details.risk-signals.severity');

  return (
    <>
      <td>
        {riskSignal.severity === 'high' && (
          <Badge variant="error">{t('high')}</Badge>
        )}
        {riskSignal.severity === 'medium' && (
          <Badge variant="warning">{t('medium')}</Badge>
        )}
        {riskSignal.severity === 'low' && (
          <Badge variant="info">{t('low')}</Badge>
        )}
      </td>
      <td>{riskSignal.scope}</td>
      <td>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {riskSignal.note}
          <Tooltip text={riskSignal.noteDetails}>
            <Box>
              <IcoInfo16 />
            </Box>
          </Tooltip>
        </Box>
      </td>
    </>
  );
};

export default Row;
