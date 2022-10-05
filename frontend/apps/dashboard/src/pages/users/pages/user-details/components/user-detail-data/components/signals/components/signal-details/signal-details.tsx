import { getErrorMessage } from '@onefootprint/request';
import { Drawer } from '@onefootprint/ui';
import React from 'react';

import useSignalsFilters from '../../hooks/use-signals-filters';
import SignalDetailsData from './components/signal-details-data';
import SignalDetailError from './components/signal-details-error';
import SignalDetailLoading from './components/signal-details-loading';
import useRiskSignalDetails from './hooks/use-risk-signal-details';

const SignalDetails = () => {
  const { query, reset } = useSignalsFilters();
  const isOpen = !!query.signal_id;
  const { data, isLoading, error } = useRiskSignalDetails(query.signal_id);

  return (
    <Drawer open={isOpen} title="Warm Address Alert" onClose={reset}>
      <>
        {data && <SignalDetailsData riskSignal={data} />}
        {isLoading && <SignalDetailLoading />}
        {error && <SignalDetailError message={getErrorMessage(error)} />}
      </>
    </Drawer>
  );
};

export default SignalDetails;
