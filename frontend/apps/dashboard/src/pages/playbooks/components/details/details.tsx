import { useTranslation } from '@onefootprint/hooks';
import { Drawer } from '@onefootprint/ui';
import React from 'react';

import useFilters from '@/playbooks/hooks/use-filters';
import usePlaybook from '@/playbooks/hooks/use-playbook';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';

const Details = () => {
  const { t, allT } = useTranslation('pages.playbooks.details');
  const { query, push } = useFilters();
  const isOpen = !!query.onboarding_config_id;
  const { data, isLoading, errorMessage } = usePlaybook(
    query.onboarding_config_id,
  );

  const getDrawerTitle = () => {
    if (data) {
      return t('title');
    }
    return isLoading
      ? allT('notifications.loading')
      : allT('notifications.error');
  };

  const handleClose = () => {
    push({ ...query, onboarding_config_id: undefined });
  };

  return (
    <Drawer open={isOpen} title={getDrawerTitle()} onClose={handleClose}>
      <>
        {data && <Content playbook={data} />}
        {isLoading && <Loading />}
        {errorMessage && <Error message={errorMessage} />}
      </>
    </Drawer>
  );
};

export default Details;
