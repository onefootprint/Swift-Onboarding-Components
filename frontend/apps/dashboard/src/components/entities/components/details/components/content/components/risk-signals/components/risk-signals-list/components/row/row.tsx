import { IcoInfo16 } from '@onefootprint/icons';
import type { RiskSignal } from '@onefootprint/types';
import { Badge, Tooltip } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { createCapitalStringList } from 'src/utils/create-string-list';
import styled, { css } from 'styled-components';

import SeverityBadge from '../severity-badge';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
  const { t } = useTranslation('common');
  const uniqueScopes = Array.from(new Set(riskSignal.scopes));
  const scopesList = uniqueScopes.map(scope => t(`signal-attributes.${scope}` as ParseKeys<'common'>));

  return (
    <>
      <td aria-label="badge">
        <SeverityBadge severity={riskSignal.severity} />
      </td>
      <td>{createCapitalStringList(scopesList)}</td>
      <td>
        <Tooltip text={riskSignal.description} alignment="start">
          <RowData>
            <Badge variant="info" maxWidth="95%">
              <ReasonCode>{riskSignal.reasonCode}</ReasonCode>
            </Badge>
            <IcoInfo16 />
          </RowData>
        </Tooltip>
      </td>
    </>
  );
};

const RowData = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    gap: ${theme.spacing[2]};
    align-items: center;
  `}
`;

const ReasonCode = styled.div`
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export default Row;
