import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronRight24 } from '@onefootprint/icons';
import { RiskSignal, RiskSignalSeverity } from '@onefootprint/types';
import { Badge, Box } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
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
      <td title={riskSignal.description}>
        <Description>{riskSignal.description}</Description>
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

const Description = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default Row;
