import { IcoChevronRight24 } from '@onefootprint/icons';
import { RiskSignal } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import SeverityBadge from '../../../../../../../severity-badge';

type RelatedSignalRowProps = {
  riskSignal: RiskSignal;
};

const RelatedSignalRow = ({ riskSignal }: RelatedSignalRowProps) => (
  <>
    <td>
      <SeverityBadge severity={riskSignal.severity} />
    </td>
    <td>{riskSignal.note}</td>
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

export default RelatedSignalRow;
