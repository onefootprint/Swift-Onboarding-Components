import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import { RiskSignal } from '@onefootprint/types';
import { Box, Tooltip } from '@onefootprint/ui';
import React from 'react';
import createStringList from 'src/utils/create-string-list/create-string-list';

import SeverityBadge from '../severity-badge';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
  const { allT } = useTranslation('pages.user-details.risk-signals.severity');
  const uniqueScopes = Array.from(new Set(riskSignal.scopes));
  const scopesList = uniqueScopes.map(scope =>
    allT(`signal-attributes.${scope}`),
  );

  return (
    <>
      <td>
        <SeverityBadge severity={riskSignal.severity} />
      </td>
      <td>{createStringList(scopesList)}</td>
      <td>
        <Tooltip text={riskSignal.description}>
          <Box sx={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            {riskSignal.note}
            <IcoInfo16 />
          </Box>
        </Tooltip>
      </td>
    </>
  );
};

export default Row;
