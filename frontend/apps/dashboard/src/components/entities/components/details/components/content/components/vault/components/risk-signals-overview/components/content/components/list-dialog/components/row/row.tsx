import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronRight24, IcoInfo16 } from '@onefootprint/icons';
import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalSeverity } from '@onefootprint/types';
import { Badge, Stack, Tooltip, Typography } from '@onefootprint/ui';
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
      <Stack as="td" gap={2} width="100%">
        <Stack
          inline
          align="center"
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography variant="label-3">{riskSignal.note}</Typography>
        </Stack>
        <Tooltip text={riskSignal.description}>
          <IcoInfo16 />
        </Tooltip>
      </Stack>
      <td>
        <Stack justify="flex-end">
          <IcoChevronRight24 />
        </Stack>
      </td>
    </>
  );
};

export default Row;
