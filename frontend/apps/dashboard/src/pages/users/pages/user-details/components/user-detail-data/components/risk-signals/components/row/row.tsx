import { useTranslation } from '@onefootprint/hooks';
import { RiskSignal } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import SeverityBadge from '../severity-badge';

type RowProps = {
  signal: RiskSignal;
};

const Row = ({ signal }: RowProps) => {
  const { allT } = useTranslation('pages.user-details.risk-signals.severity');

  return (
    <>
      <td>
        <SeverityBadge severity={signal.severity} />
      </td>
      <td>
        {signal.scopes.map(signalAttribute =>
          allT(`signal-attributes.${signalAttribute}`),
        )}
      </td>
      <td>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {signal.description}
        </Box>
      </td>
    </>
  );
};

export default Row;
