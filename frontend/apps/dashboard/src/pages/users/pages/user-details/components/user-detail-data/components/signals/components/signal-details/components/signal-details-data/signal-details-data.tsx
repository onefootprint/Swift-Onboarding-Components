import type { RiskSignal } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Overview from './components/overview';

type SignalDetailsDataProps = {
  riskSignal: RiskSignal;
};

const SignalDetailsData = ({ riskSignal }: SignalDetailsDataProps) => (
  <>
    <Box sx={{ marginBottom: 9 }}>
      <Overview
        note={riskSignal.note}
        scopes={riskSignal.scopes}
        severity={riskSignal.severity}
        vendors={riskSignal.vendors}
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

export default SignalDetailsData;
