import { useTranslation } from '@onefootprint/hooks';
import { Drawer } from '@onefootprint/ui';
import React from 'react';
import useFilters from 'src/pages/playbooks/utils/use-filters';
import usePlaybook from 'src/pages/playbooks/utils/use-playbook';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';

const Details = () => {
  const { t } = useTranslation();
  const { query, clear } = useFilters();
  const isOpen = !!query.onboarding_config_id;
  const { data, isLoading, errorMessage } = usePlaybook(
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
        {data && <Content playbook={data} />}
        {isLoading && <Loading />}
        {errorMessage && <Error message={errorMessage} />}
      </>
    </Drawer>
  );
};

export default Details;
