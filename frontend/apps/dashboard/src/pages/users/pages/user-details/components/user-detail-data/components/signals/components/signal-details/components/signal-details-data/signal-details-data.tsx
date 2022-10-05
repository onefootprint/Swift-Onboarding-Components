import type { RiskSignalDetails } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Overview from './components/overview';
import RawResponse from './components/raw-response';
import RelatedSignals from './components/related-signals';

type SignalDetailsDataProps = {
  riskSignal: RiskSignalDetails;
};

const SignalDetailsData = ({ riskSignal }: SignalDetailsDataProps) => (
  <>
    <Box sx={{ marginBottom: 9 }}>
      <Overview
        dataVendor={riskSignal.dataVendor}
        note={riskSignal.note}
        noteDetails={riskSignal.noteDetails}
        scope={riskSignal.scope}
        severity={riskSignal.severity}
      />
    </Box>
    <Box sx={{ marginBottom: 9 }}>
      <RelatedSignals relatedSignals={riskSignal.relatedSignals} />
    </Box>
    <Box>
      <RawResponse rawResponse={riskSignal.rawResponse} />
    </Box>
  </>
);

export default SignalDetailsData;
