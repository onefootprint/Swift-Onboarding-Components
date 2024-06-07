import { IcoChevronRight24, IcoInfo16 } from '@onefootprint/icons';
import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalSeverity } from '@onefootprint/types';
import { Badge, Stack, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.severity',
  });

  return (
    <>
      <StyledTd>
        {riskSignal.severity === RiskSignalSeverity.High && <Badge variant="error">{t('high')}</Badge>}
        {riskSignal.severity === RiskSignalSeverity.Medium && <Badge variant="warning">{t('medium')}</Badge>}
        {riskSignal.severity === RiskSignalSeverity.Low && <Badge variant="info">{t('low')}</Badge>}
      </StyledTd>
      <Stack tag="td" gap={2} width="100%">
        <Stack inline align="center" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
          <Text variant="label-3">{riskSignal.note}</Text>
        </Stack>
        <Tooltip text={riskSignal.description}>
          <IcoInfo16 />
        </Tooltip>
      </Stack>
      <td aria-label="icon">
        <Stack justify="flex-end">
          <IcoChevronRight24 />
        </Stack>
      </td>
    </>
  );
};

const StyledTd = styled.td`
  && {
    padding-right: 0;
  }
`;

export default Row;
