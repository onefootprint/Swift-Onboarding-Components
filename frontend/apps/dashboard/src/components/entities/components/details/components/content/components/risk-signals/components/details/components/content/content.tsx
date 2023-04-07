import type { RiskSignal } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Overview from './components/overview';

type ContentProps = {
  riskSignal: RiskSignal;
};

const Content = ({ riskSignal }: ContentProps) => (
  <>
    <Box sx={{ marginBottom: 9 }}>
      <Overview
        description={riskSignal.description}
        scopes={riskSignal.scopes}
        severity={riskSignal.severity}
      />
    </Box>
    {/* 
      TODO: https://linear.app/footprint/issue/FP-1690/risk-signal-details-show-related-signals
      <Box sx={{ marginBottom: 9 }}>
      <RelatedSignals relatedSignals={riskSignal.relatedSignals} />
    </Box> */}
    {/* 
      TODO: https://linear.app/footprint/issue/FP-1689/risk-signal-details-show-raw-response
      <Box>
      <RawResponse rawResponse={riskSignal.rawResponse} />
    </Box> */}
  </>
);

export default Content;
