import { useTranslation } from '@onefootprint/hooks';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import getCurrentStepFromMissingAttributes from '../../components/navigation-header/utils/current-step-from-missing-attributes';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncEmail from '../../hooks/use-sync-email';
import { isMissingEmailAttribute } from '../../utils/missing-attributes';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import EmailSection from './components/email-section';
import IdentitySection from './components/identity-section';

const Confirm = () => {
  const { t } = useTranslation('pages.confirm');
  const [state, send] = useCollectKycDataMachine();
  const { authToken, data, config, sandboxSuffix, requirement, initialData } =
    state.context;
  const { missingAttributes } = requirement;
  const isSandbox = !config.isLive;
  const { mutation: syncDataMutation, syncData } = useSyncData();
  const { mutation: syncEmailMutation, syncEmail } = useSyncEmail();
  const isLoading = syncEmailMutation.isLoading || syncDataMutation.isLoading;
  const value = getCurrentStepFromMissingAttributes(
    requirement,
    initialData,
    state.value,
  );
  const shouldShowBackButton = value > 0;
  const headerVariant = shouldShowBackButton ? 'back' : 'close';

  const handleSyncData = () => {
    syncData({
      data,
      speculative: false,
      onSuccess: () => {
        send({
          type: 'confirmed',
        });
      },
    });
  };

  const handleConfirm = () => {
    // If email is missing, we need to sync it successfully before we can
    // sync the rest of the kyc data.
    if (!isMissingEmailAttribute(missingAttributes)) {
      handleSyncData();
      return;
    }

    if (isSandbox && !sandboxSuffix) {
      console.error(
        'Found empty sandbox suffix in collect-kyc-data email-collect form while in sandbox mode.',
      );
    }

    syncEmail({
      authToken,
      email: data[IdDI.email]?.value,
      sandboxSuffix,
      speculative: false,
      onSuccess: handleSyncData,
    });
  };

  const handlePrev = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  return (
    <ConfirmCollectedData
      title={t('summary.title')}
      subtitle={t('summary.subtitle')}
      cta={t('summary.cta')}
      onClickPrev={handlePrev}
      onClickConfirm={handleConfirm}
      isLoading={isLoading}
      headerVariant={headerVariant}
    >
      <EmailSection />
      <BasicInfoSection />
      <AddressSection />
      <IdentitySection />
    </ConfirmCollectedData>
  );
};

export default Confirm;
