import type { RiskSignal } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Overview from './components/overview';

type ContentProps = {
  riskSignal: RiskSignal;
};

const Content = ({ riskSignal }: ContentProps) => (
  <Box marginBottom={9}>
    <Overview
      description={riskSignal.description}
      scopes={riskSignal.scopes}
      severity={riskSignal.severity}
    />
  </Box>
);

export default Content;
