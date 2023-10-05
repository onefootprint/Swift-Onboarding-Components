import { Logger } from '@onefootprint/dev-tools';
import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import BasicDataSection from './components/basic-data-section';
import BeneficialOwnersSection from './components/beneficial-owners-section';
import BusinessAddressSection from './components/business-address-section';

const Confirm = () => {
  const { t } = useTranslation('pages.confirm.summary');
  const [state, send] = useCollectKybDataMachine();
  const { authToken, data } = state.context;
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
        console.error(`Vaulting data failed in kyb confirm page: ${error}`);
        Logger.error(
          `Vaulting data failed in kyb confirm page: ${error}`,
          'kyb-confirm',
        );
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
