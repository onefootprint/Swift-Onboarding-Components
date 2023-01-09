import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Drawer } from '@onefootprint/ui';
import React from 'react';

import useRiskSignalsFilters from '../../hooks/use-risk-signals-filters';
import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import useRiskSignalDetails from './hooks/use-risk-signal-details';

const Details = () => {
  const { t } = useTranslation();
  const { query, reset } = useRiskSignalsFilters();
  const isOpen = !!query.signal_id;
  const { data, isLoading, error } = useRiskSignalDetails(query.signal_id);

  const getDrawerTitle = () => {
    if (data) {
      return data.description;
    }
    return isLoading ? t('notifications.loading') : t('notifications.error');
  };

  return (
    <Drawer open={isOpen} title={getDrawerTitle()} onClose={reset}>
      <>
        {data && <Data riskSignal={data} />}
        {isLoading && <Loading />}
        {error && <Error message={getErrorMessage(error)} />}
      </>
    </Drawer>
  );
};

export default Details;
