import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { IdDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import Logger from '../../../../utils/logger';
import getCurrentStepFromMissingAttributes from '../../components/navigation-header/utils/current-step-from-missing-attributes';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import type { SyncDataFieldErrors } from '../../hooks/use-sync-data';
import useSyncData from '../../hooks/use-sync-data';
import useSyncEmail from '../../hooks/use-sync-email';
import { isMissingEmailAttribute } from '../../utils/missing-attributes';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import EmailSection from './components/email-section';
import IdentitySection from './components/identity-section';
import LegalStatusSection from './components/legal-status-section';

const Confirm = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.confirm' });
  const showRequestErrorToast = useRequestErrorToast();
  const [state, send] = useCollectKycDataMachine();
  const { authToken, data, requirement, initialData } = state.context;
  const { mutation: syncDataMutation, syncData } = useSyncData();
  const { mutation: syncEmailMutation, syncEmail } = useSyncEmail();
  const isLoading = syncEmailMutation.isLoading || syncDataMutation.isLoading;
  const toast = useToast();

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
      onError: (fieldErrors: SyncDataFieldErrors) => {
        // We can't show the error messages as hints unless the sub-forms are in edit mode
        // For simplicity, just show the field names.
        // Ideally, these errors should be caught in earlier pages anyways (unless bootstrapped)
        if (typeof fieldErrors === 'string') {
          toast.show({
            title: t('errors.invalid-inputs.title'),
            description: t('errors.invalid-inputs.description-with-message', {
              message: fieldErrors,
            }),
            variant: 'error',
          });
          return;
        }
        const fields = Object.keys(fieldErrors).filter(di =>
          Object.values(IdDI).includes(di as IdDI),
        );
        if (fields.length === 0) {
          toast.show({
            title: t('errors.invalid-inputs.title'),
            description: t('errors.invalid-inputs.description-generic'),
            variant: 'error',
          });
          return;
        }
        const fieldNames = fields.map(di => t(`di.${di}`)).join(', ');
        toast.show({
          title: t('errors.invalid-inputs.title'),
          description: t('errors.invalid-inputs.description-with-fields', {
            fields: fieldNames,
          }),
          variant: 'error',
        });
      },
    });
  };

  const handleConfirm = () => {
    // If email is missing, we need to sync it successfully before we can
    // sync the rest of the kyc data.
    const attributes = [
      ...requirement.missingAttributes,
      ...requirement.optionalAttributes,
    ];
    if (!isMissingEmailAttribute(attributes)) {
      handleSyncData();
      return;
    }

    syncEmail({
      authToken,
      email: data[IdDI.email]?.value,
      speculative: false,
      onSuccess: handleSyncData,
      onError: (error: unknown) => {
        Logger.error(
          `Speculatively sycing email data on kyc confirm page failed. ${getErrorMessage(
            error,
          )}`,
          'kyc-confirm',
        );
        showRequestErrorToast(error);
      },
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
      <LegalStatusSection />
      <IdentitySection />
    </ConfirmCollectedData>
  );
};

export default Confirm;
