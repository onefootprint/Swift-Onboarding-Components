import { getErrorMessage } from '@onefootprint/request';
import { Drawer } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useFilters from '../../hooks/use-filters';
import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import useProxyConfig from './hooks/use-proxy-config';

const Details = () => {
  const { t } = useTranslation();
  const { query, clear } = useFilters();
  const isOpen = !!query.proxy_config_id;
  const { data, isLoading, error } = useProxyConfig(query.proxy_config_id);

  const getDrawerTitle = () => {
    if (data) {
      return data.name;
    }
    return isLoading ? t('notifications.loading') : t('notifications.error');
  };

  return (
    <Drawer open={isOpen} title={getDrawerTitle()} onClose={clear}>
      <>
        {data && <Content proxyConfig={data} />}
        {isLoading && <Loading />}
        {error && <ErrorComponent message={getErrorMessage(error)} />}
      </>
    </Drawer>
  );
};

export default Details;
