import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import Logger from '../../../../utils/logger';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import BasicDataSection from './components/basic-data-section';
import BeneficialOwnersSection from './components/beneficial-owners-section';
import BusinessAddressSection from './components/business-address-section';

const Confirm = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.confirm.summary',
  });
  const [state, send] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    data,
  } = state.context;
  const { mutation, syncData } = useSyncData();
  const { isLoading } = mutation;

  const handleConfirm = () => {
    syncData({
      authToken,
      data,
      speculative: false,
      onSuccess: () => {
        send({
          type: 'confirmed',
        });
      },
      onError: (error: string) => {
        Logger.error(`Vaulting data failed in kyb confirm page: ${error}`, {
          location: 'kyb-confirm',
        });
      },
    });
  };

  const handlePrev = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  return (
    <ConfirmCollectedData
      title={t('title')}
      subtitle={t('subtitle')}
      cta={t('cta')}
      onClickPrev={handlePrev}
      onClickConfirm={handleConfirm}
      isLoading={isLoading}
    >
      <BasicDataSection />
      <BusinessAddressSection />
      <BeneficialOwnersSection />
    </ConfirmCollectedData>
  );
};

export default Confirm;
