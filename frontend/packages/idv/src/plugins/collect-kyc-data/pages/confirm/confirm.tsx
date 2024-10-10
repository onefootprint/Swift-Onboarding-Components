import { IdDI } from '@onefootprint/types';
import { LoadingSpinner, Stack, useToast } from '@onefootprint/ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import { useUserAuthMethods } from '../../../../queries';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import type { SyncDataFieldErrors } from '../../hooks/use-sync-data';
import useSyncData, { checkPhoneEmailBeforeSubmit } from '../../hooks/use-sync-data';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import { getVerifiedMap, getVerifiedMethods } from './components/basic-info-section/helpers';
import IdentitySection from './components/identity-section';
import LegalStatusSection from './components/legal-status-section';

const Confirm = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.confirm' });

  const [state, send] = useCollectKycDataMachine();
  const { authToken, data, requirement, initialData, dataCollectionScreensToShow, isConfirmScreenVisible } =
    state.context;
  const { mutation: syncDataMutation, syncData } = useSyncData();

  const toast = useToast();
  const qryUserAuthMethods = useUserAuthMethods(authToken);

  const currentPageIdx = dataCollectionScreensToShow.indexOf(state.value);
  const shouldShowBackButton = currentPageIdx > 0;
  const headerVariant = shouldShowBackButton ? 'back' : 'close';

  const verifiedMethods = useMemo(() => {
    const map = getVerifiedMap(qryUserAuthMethods.data);
    return {
      ...getVerifiedMethods(data, map),
      isLoading: qryUserAuthMethods.isLoading,
    };
  }, [qryUserAuthMethods.data, qryUserAuthMethods.isLoading, data]);

  const handleConfirm = () => {
    syncData({
      data: checkPhoneEmailBeforeSubmit(initialData, data, requirement, verifiedMethods),
      onSuccess: () => send({ type: 'confirmed' }),
      onError: (fieldErrors: SyncDataFieldErrors) => {
        send({ type: 'confirmFailed' });
        // We can't show the error messages as hints unless the sub-forms are in edit mode
        // For simplicity, just show the field names.
        // Ideally, these errors should be caught in earlier pages anyways (unless bootstrapped)
        if (typeof fieldErrors === 'string') {
          toast.show({
            title: t('errors.invalid-inputs.title'),
            description: t('errors.invalid-inputs.description-with-message', { message: fieldErrors }),
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
        const fieldNames = fields.map(di => t(`di.${di}` as unknown as TemplateStringsArray)).join(', ');
        toast.show({
          title: t('errors.invalid-inputs.title'),
          description: t('errors.invalid-inputs.description-with-fields', { fields: fieldNames }),
          variant: 'error',
        });
      },
    });
  };

  /** If skip_confirm flag is enabled, trigger confirmation CTA silently */
  useEffect(() => {
    if (!isConfirmScreenVisible && syncDataMutation.isIdle && !syncDataMutation.isPending) {
      handleConfirm();
    }
  }, [isConfirmScreenVisible, syncDataMutation.isIdle, syncDataMutation.isPending]);

  return isConfirmScreenVisible ? (
    <ConfirmCollectedData
      title={t('summary.title')}
      subtitle={t('summary.subtitle')}
      cta={t('summary.cta')}
      onClickPrev={() => send({ type: 'navigatedToPrevPage' })}
      onClickConfirm={handleConfirm}
      isLoading={syncDataMutation.isPending}
      headerVariant={headerVariant}
    >
      <BasicInfoSection verifiedMethods={verifiedMethods} />
      <AddressSection />
      <LegalStatusSection />
      <IdentitySection />
    </ConfirmCollectedData>
  ) : (
    <Stack
      height="100%"
      minHeight="var(--loading-container-min-height)"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <LoadingSpinner />
    </Stack>
  );
};

export default Confirm;
