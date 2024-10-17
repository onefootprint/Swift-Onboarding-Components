import { IcoChevronLeft24, IcoClose24 } from '@onefootprint/icons';
import type { AmlHitMedia } from '@onefootprint/types';
import { Drawer } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorComponent } from 'src/components';
import { createCapitalStringList } from 'src/utils/create-string-list';

import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

import Content from './components/content';
import Loading from './components/loading';
import useRiskSignalDetails from './hooks/use-risk-signal-details';

const StandardDetails = () => {
  const { t } = useTranslation();
  const { t: entityT } = useTranslation('entity-details');
  const { query, values, clear } = useRiskSignalsFilters();
  const isOpen = !!query.risk_signal_id && !query.is_sentilink;
  const { data, isPending, error } = useRiskSignalDetails({
    riskSignalId: !values.isSentilink ? values.riskSignalId : undefined,
  });
  const [amlMedia, setAmlMedia] = useState([] as AmlHitMedia[]);

  const getDrawerTitle = () => {
    if (data) {
      if (data.scopes?.length) {
        const scopesTitle = createCapitalStringList(data.scopes);
        return amlMedia.length
          ? `${entityT('risk-signals.details.matches.hits-media.drawer-title')} • ${scopesTitle}`
          : scopesTitle;
      }
      return data.note;
    }
    return isPending ? t('notifications.loading') : t('notifications.error');
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
        {isPending && <Loading />}
        {error && <ErrorComponent error={error} />}
      </>
    </Drawer>
  );
};

export default StandardDetails;
