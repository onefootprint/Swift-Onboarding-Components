import { IcoChevronLeft24, IcoClose24 } from '@onefootprint/icons';
import type { AmlHitMedia } from '@onefootprint/types';
import { Drawer } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorComponent } from 'src/components';
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
  const [amlMedia, setAmlMedia] = useState([] as AmlHitMedia[]);

  const getDrawerTitle = () => {
    if (data) {
      if (data.scopes?.length) {
        const scopesTitle = createCapitalStringList(data.scopes);
        return amlMedia.length
          ? `${t('pages.entity.risk-signals.details.matches.hits-media.drawer-title')} • ${scopesTitle}`
          : scopesTitle;
      }
      return data.note;
    }
    return isLoading ? t('notifications.loading') : t('notifications.error');
  };

  const handleHideAmlMedia = () => setAmlMedia([]);

  const handleClickOutside = () => {
    clear();
    if (amlMedia.length) handleHideAmlMedia();
  };

  return (
    <Drawer
      open={isOpen}
      title={getDrawerTitle()}
      onClickOutside={handleClickOutside}
      onClose={amlMedia.length ? handleHideAmlMedia : clear}
      closeIconComponent={amlMedia.length ? IcoChevronLeft24 : IcoClose24}
    >
      <>
        {data && <Content riskSignal={data} handleShowAmlMedia={setAmlMedia} amlMedia={amlMedia} />}
        {isLoading && <Loading />}
        {error && <ErrorComponent error={error} />}
      </>
    </Drawer>
  );
};

export default Details;
