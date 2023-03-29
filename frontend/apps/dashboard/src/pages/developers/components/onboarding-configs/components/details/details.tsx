import { useTranslation } from '@onefootprint/hooks';
import { Drawer } from '@onefootprint/ui';
import React from 'react';

import useFilters from '../../hooks/use-filters';
import useOnboardingConfig from '../../hooks/use-onboarding-config';
import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';

const Details = () => {
  const { t } = useTranslation();
  const { query, clear } = useFilters();
  const isOpen = !!query.onboarding_config_id;
  const { data, isLoading, errorMessage } = useOnboardingConfig(
    query.onboarding_config_id,
  );

  const getDrawerTitle = () => {
    if (data) {
      return data.name;
    }
    return isLoading ? t('notifications.loading') : t('notifications.error');
  };

  return (
    <Drawer open={isOpen} title={getDrawerTitle()} onClose={clear}>
      <>
        {data && <Content onboardingConfig={data} />}
        {isLoading && <Loading />}
        {errorMessage && <Error message={errorMessage} />}
      </>
    </Drawer>
  );
};

export default Details;
