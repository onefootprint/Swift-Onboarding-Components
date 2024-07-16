import type { CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import { ConfirmCollectedData } from '@/components/confirm-collected-data';
import useRequestErrorToast from '@/hooks/use-request-error-toast';
import type { SyncDataFieldErrors } from '@/hooks/use-sync-data';
import useSyncData from '@/hooks/use-sync-data';
import useSyncEmail from '@/hooks/use-sync-email';
import useTranslation from '@/hooks/use-translation';
import type { KycData } from '@/types';
import { isMissingEmailAttribute } from '@/utils/missing-attributes';

import AddressSection from './components/address-section/address-section';
import BasicInfoSection from './components/basic-info-section';
import IdentitySection from './components/identity-section/identity-section';

type ConfirmProps = {
  requirement: CollectKycDataRequirement;
  data: KycData;
  config: PublicOnboardingConfig;
  authToken: string;
  onComplete: () => void;
  onConfirm: (data: KycData) => void;
};

const Confirm = ({ requirement, data, authToken, onComplete, onConfirm, config }: ConfirmProps) => {
  const { t } = useTranslation('pages.confirm');
  const { mutation: syncDataMutation, syncData } = useSyncData();
  const { mutation: syncEmailMutation, syncEmail } = useSyncEmail();
  const isLoading = syncEmailMutation.isLoading || syncDataMutation.isLoading;
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const handleSyncData = () => {
    syncData({
      data,
      speculative: false,
      requirement,
      authToken,
      onSuccess: onComplete,
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
        const fields = Object.keys(fieldErrors).filter(di => Object.values(IdDI).includes(di as IdDI));
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
    const attributes = [...requirement.missingAttributes, ...requirement.optionalAttributes];
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
        showRequestErrorToast(error);
      },
    });
  };

  return (
    <ConfirmCollectedData
      title={t('summary.title')}
      subtitle={t('summary.subtitle')}
      cta={t('summary.cta')}
      onClickConfirm={handleConfirm}
      isLoading={isLoading}
    >
      <BasicInfoSection authToken={authToken} requirement={requirement} data={data} onConfirm={onConfirm} />
      <AddressSection
        authToken={authToken}
        requirement={requirement}
        data={data}
        onConfirm={onConfirm}
        config={config}
      />
      <IdentitySection data={data} onConfirm={onConfirm} requirement={requirement} authToken={authToken} />
    </ConfirmCollectedData>
  );
};

export default Confirm;
