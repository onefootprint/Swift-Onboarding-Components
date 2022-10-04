import { getErrorMessage } from '@onefootprint/request';
import { Drawer } from '@onefootprint/ui';
import React from 'react';

import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import useFilters from './hooks/use-filters';
import useRiskSignalDetails from './hooks/use-risk-signal-details';

const Details = () => {
  const { filters, reset } = useFilters();
  const isOpen = !!filters.risk_signal_id;
  const { data, isLoading, error } = useRiskSignalDetails(
    filters.risk_signal_id,
  );

  return (
    <Drawer open={isOpen} title="Warm Address Alert" onClose={reset}>
      <>
        {data && <Data riskSignal={data} />}
        {isLoading && <Loading />}
        {error && <Error message={getErrorMessage(error)} />}
      </>
    </Drawer>
  );
};

export default Details;
