import { useTranslation } from '@onefootprint/hooks';
import { Drawer } from '@onefootprint/ui';
import React from 'react';
import { Error } from 'src/components';
import { createCapitalStringList } from 'src/utils/create-string-list';

import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

import Content from './components/content';
import Loading from './components/loading';
import useRiskSignalDetails from './hooks/use-risk-signal-details';

const Details = () => {
  const { t } = useTranslation();
  const { query, clear } = useRiskSignalsFilters();
  const isOpen = !!query.risk_signal_id;
  const { data, isLoading, error } = useRiskSignalDetails(query.risk_signal_id);

  const getDrawerTitle = () => {
    if (data) {
      return data.scopes.length
        ? createCapitalStringList(data.scopes)
        : data.note;
    }
    return isLoading ? t('notifications.loading') : t('notifications.error');
  };

  return (
    <Drawer open={isOpen} title={getDrawerTitle()} onClose={clear}>
      <>
        {data && <Content riskSignal={data} />}
        {isLoading && <Loading />}
        {error && <Error error={error} />}
      </>
    </Drawer>
  );
};

export default Details;
