import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import { RiskSignal } from '@onefootprint/types';
import { Box, Tooltip } from '@onefootprint/ui';
import React from 'react';

import SeverityBadge from '../severity-badge';

type RowProps = {
  riskSignal: RiskSignal;
};

const Row = ({ riskSignal }: RowProps) => {
  const { allT } = useTranslation('pages.user-details.risk-signals.severity');

  return (
    <>
      <td>
        <SeverityBadge severity={riskSignal.severity} />
      </td>
      <td>
        {riskSignal.scopes.map(scope => allT(`signal-attributes.${scope}`))}
      </td>
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
