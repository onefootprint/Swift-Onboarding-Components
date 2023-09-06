import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { RiskSignal } from '@onefootprint/types';
import { Tooltip } from '@onefootprint/ui';
import React from 'react';
import { createCapitalStringList } from 'src/utils/create-string-list';

import SeverityBadge from '../severity-badge';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
  const { allT } = useTranslation('pages.entity.risk-signals.severity');
  const uniqueScopes = Array.from(new Set(riskSignal.scopes));
  const scopesList = uniqueScopes.map(scope =>
    allT(`signal-attributes.${scope}`),
  );
  const shouldShowTooltip = riskSignal.description !== riskSignal.note;

  return (
    <>
      <td>
        <SeverityBadge severity={riskSignal.severity} />
      </td>
      <td>{createCapitalStringList(scopesList)}</td>
      <td>
        <RowData>
          <Note>{riskSignal.note}</Note>
          {shouldShowTooltip && (
            <Tooltip text={riskSignal.description} alignment="start">
              <IcoInfo16 />
            </Tooltip>
          )}
        </RowData>
      </td>
    </>
  );
};

const RowData = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[2]};
    display: flex;
    align-items: center;
  `}
`;

const Note = styled.div`
  display: block
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export default Row;
