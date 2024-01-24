import { Drawer } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useFilters from '@/playbooks/hooks/use-filters';
import usePlaybook from '@/playbooks/hooks/use-playbook';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';

const Details = () => {
  const { t } = useTranslation('common');
  const { query, push } = useFilters();
  const isOpen = !!query.onboarding_config_id;
  const { data, isLoading, errorMessage } = usePlaybook(
    query.onboarding_config_id,
  );

  const getDrawerTitle = () => {
    if (data) {
      return t('pages.playbooks.details.title');
    }
    return isLoading ? t('notifications.loading') : t('notifications.error');
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
