import { useTranslation } from 'react-i18next';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import { getLogger } from '../../../../utils/logger';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import BasicDataSection from './components/basic-data-section';
import BeneficialOwnersSection from './components/beneficial-owners-section';
import BusinessAddressSection from './components/business-address-section';
import IdentitySection from './components/identity-section';

const { logError } = getLogger({ location: 'kyb-confirm' });

const Confirm = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.confirm.summary' });
  const [state, send] = useCollectKybDataMachine();
  const { data, idvContext, dataCollectionScreensToShow } = state.context;
  const { mutation, syncData } = useSyncData();
  const { isLoading } = mutation;
  const shouldShowCloseButton = dataCollectionScreensToShow.length === 1;

  const handleConfirm = () => {
    syncData({
      authToken: idvContext.authToken,
      data,
      onSuccess: () => send({ type: 'confirmed' }),
      onError: (error: string) => {
        logError(`Vaulting data failed in kyb confirm page: ${error}`, error);
      },
    });
  };

  return (
    <ConfirmCollectedData
      title={t('title')}
      subtitle={t('subtitle')}
      cta={t('cta')}
      onClickPrev={() => send({ type: 'navigatedToPrevPage' })}
      onClickConfirm={handleConfirm}
      isLoading={isLoading}
      headerVariant={shouldShowCloseButton ? 'close' : 'back'}
    >
      <BasicDataSection />
      <IdentitySection />
      <BusinessAddressSection />
      <BeneficialOwnersSection />
    </ConfirmCollectedData>
  );
};

export default Confirm;
