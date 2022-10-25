import { useTranslation } from '@onefootprint/hooks';
import { RiskSignal } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import SeverityBadge from '../severity-badge';

type SignalRowProps = {
  signal: RiskSignal;
};

const SignalRow = ({ signal }: SignalRowProps) => {
  const { allT } = useTranslation('pages.user-details.signals.severity');

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
          {signal.note}
        </Box>
      </td>
    </>
  );
};

export default SignalRow;
