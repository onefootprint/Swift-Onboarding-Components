import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Drawer } from '@onefootprint/ui';
import React from 'react';

import useSignalsFilters from '../../hooks/use-signals-filters';
import SignalDetailsData from './components/signal-details-data';
import SignalDetailError from './components/signal-details-error';
import SignalDetailLoading from './components/signal-details-loading';
import useRiskSignalDetails from './hooks/use-risk-signal-details';

const SignalDetails = () => {
  const { t } = useTranslation();
  const { query, reset } = useSignalsFilters();
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
        {data && <SignalDetailsData riskSignal={data} />}
        {isLoading && <SignalDetailLoading />}
        {error && <SignalDetailError message={getErrorMessage(error)} />}
      </>
    </Drawer>
  );
};

export default SignalDetails;
