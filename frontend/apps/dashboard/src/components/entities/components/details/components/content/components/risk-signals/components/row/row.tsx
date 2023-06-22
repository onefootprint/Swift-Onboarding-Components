import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import { RiskSignal } from '@onefootprint/types';
import { Box, Tooltip } from '@onefootprint/ui';
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
        {shouldShowTooltip ? (
          <Tooltip text={riskSignal.description}>
            <Box sx={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
              {riskSignal.note}
              <IcoInfo16 />
            </Box>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            {riskSignal.note}
          </Box>
        )}
      </td>
    </>
  );
};

export default Row;
