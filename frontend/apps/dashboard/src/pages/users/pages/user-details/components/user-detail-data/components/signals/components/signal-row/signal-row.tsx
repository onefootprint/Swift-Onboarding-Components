import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import type { RiskSignal } from '@onefootprint/types';
import { Badge, Box, Tooltip } from '@onefootprint/ui';
import React from 'react';

type SignalRowProps = {
  signal: RiskSignal;
};

const SignalRow = ({ signal }: SignalRowProps) => {
  const { t } = useTranslation('pages.user-details.signals.severity');

  return (
    <>
      <td>
        {signal.severity === 'high' && (
          <Badge variant="error">{t('high')}</Badge>
        )}
        {signal.severity === 'medium' && (
          <Badge variant="warning">{t('medium')}</Badge>
        )}
        {signal.severity === 'low' && <Badge variant="info">{t('low')}</Badge>}
      </td>
      <td>{signal.scope}</td>
      <td>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {signal.note}
          <Tooltip text={signal.noteDetails}>
            <Box sx={{ display: 'flex' }}>
              <IcoInfo16 />
            </Box>
          </Tooltip>
        </Box>
      </td>
    </>
  );
};

export default SignalRow;
