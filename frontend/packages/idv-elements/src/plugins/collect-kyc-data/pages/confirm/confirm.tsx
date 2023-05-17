import { useTranslation } from '@onefootprint/hooks';
import { IdDI } from '@onefootprint/types';
import React, { useState } from 'react';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import getCurrentStepFromMissingAttributes from '../../components/navigation-header/utils/current-step-from-missing-attributes';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncEmail from '../../hooks/use-sync-email';
import { isMissingEmailAttribute } from '../../utils/missing-attributes/missing-attributes';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import EditSheet, { EditSection } from './components/edit-sheet';
import EmailSection from './components/email-section';
import IdentitySection from './components/identity-section';

const Confirm = () => {
  const { t } = useTranslation('pages.confirm');
  const [state, send] = useCollectKycDataMachine();
  const {
    authToken,
    data,
    config,
    sandboxSuffix,
    device,
    requirement,
    initialData,
  } = state.context;
  const { missingAttributes } = requirement;
  const isMobile = device.type === 'mobile';
  const isSandbox = !config.isLive;
  const [editContent, setEditContent] = useState<EditSection | undefined>();
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

  const handleEmailEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.email);
    } else {
      send({ type: 'editEmail' });
    }
  };

  const handleBasicInfoEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.basicInfo);
    } else {
      send({ type: 'editBasicInfo' });
    }
  };

  const handleAddressEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.address);
    } else {
      send({ type: 'editAddress' });
    }
  };

  const handleIdentityEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.identity);
    } else {
      send({ type: 'editIdentity' });
    }
  };

  const handleCloseEdit = () => {
    setEditContent(undefined);
  };

  return (
    <>
      <ConfirmCollectedData
        title={t('summary.title')}
        subtitle={t('summary.subtitle')}
        cta={t('summary.cta')}
        onClickPrev={handlePrev}
        onClickConfirm={handleConfirm}
        isLoading={isLoading}
        headerVariant={headerVariant}
      >
        <EmailSection onEdit={handleEmailEdit} />
        <BasicInfoSection onEdit={handleBasicInfoEdit} />
        <AddressSection onEdit={handleAddressEdit} />
        <IdentitySection onEdit={handleIdentityEdit} />
      </ConfirmCollectedData>
      <EditSheet
        open={!!editContent}
        onClose={handleCloseEdit}
        section={editContent}
      />
    </>
  );
};

export default Confirm;
