import { IcoChevronLeft24, IcoClose24 } from '@onefootprint/icons';
import { Drawer } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorComponent } from 'src/components';

import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

import { getEntitiesByFpIdRiskSignalsBySignalIdOptions } from '@onefootprint/axios/dashboard';
import type { AmlHitMedia } from '@onefootprint/request-types/dashboard';
import { useQuery } from '@tanstack/react-query';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import Content from './components/content';
import Loading from './components/loading';
import useScopeListText from './hooks/use-scope-list-text';

const StandardDetails = () => {
  const { t } = useTranslation();
  const { t: entityT } = useTranslation('entity-details', { keyPrefix: 'onboardings.risk-signals.drawer' });
  const scopeListT = useScopeListText();
  const entityId = useEntityId();
  const { query, values, clear } = useRiskSignalsFilters();
  const { data, isPending, error } = useQuery({
    ...getEntitiesByFpIdRiskSignalsBySignalIdOptions({
      path: { fpId: entityId, signalId: values.riskSignalId ?? '' },
    }),
    enabled: Boolean(values.riskSignalId),
  });
  const [amlMedia, setAmlMedia] = useState([] as AmlHitMedia[]);
  const isOpen = Boolean(query.risk_signal_id) && !query.is_sentilink;

  const getDrawerTitle = () => {
    if (data) {
      if (data.scopes?.length) {
        const scopesTitle = scopeListT(data.scopes);
        return amlMedia.length ? entityT('aml-title', { scopesTitle }) : scopesTitle;
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
      {data && <Content riskSignalDetail={data} handleShowAmlMedia={setAmlMedia} amlMedia={amlMedia} />}
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
    </Drawer>
  );
};

export default StandardDetails;
