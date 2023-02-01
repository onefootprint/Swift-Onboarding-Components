import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Button, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
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
  const { authToken, data, device, missingAttributes } = state.context;
  const isMobile = device?.type === 'mobile';
  const [editContent, setEditContent] = useState<EditSection | undefined>();
  const { mutation: syncDataMutation, syncData } = useSyncData();
  const { mutation: syncEmailMutation, syncEmail } = useSyncEmail();
  const isLoading = syncEmailMutation.isLoading || syncDataMutation.isLoading;

  const toast = useToast();

  const handleError = (error: unknown) => {
    toast.show({
      title: t('error.title'),
      description: t('error.description'),
      variant: 'error',
    });
    console.error(error);
  };

  const handleSyncSuccess = () => {
    send({
      type: Events.confirmed,
    });
  };

  const handleSyncData = () => {
    syncData({
      authToken,
      data,
      speculative: false,
      onSuccess: handleSyncSuccess,
      onError: handleError,
    });
  };

  const handleConfirm = () => {
    // If email is missing, we need to sync it successfully before we can
    // sync the rest of the kyc data.
    if (isMissingEmailAttribute(missingAttributes)) {
      syncEmail({
        authToken,
        email: data[UserDataAttribute.email],
        speculative: false,
        onSuccess: handleSyncData,
        onError: handleError,
      });
    } else {
      handleSyncData();
    }
  };

  const handlePrev = () => {
    send({ type: Events.navigatedToPrevPage });
  };

  const handleEmailEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.email);
    } else {
      send({ type: Events.editEmail });
    }
  };

  const handleBasicInfoEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.basicInfo);
    } else {
      send({ type: Events.editBasicInfo });
    }
  };

  const handleAddressEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.address);
    } else {
      send({ type: Events.editAddress });
    }
  };

  const handleIdentityEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.identity);
    } else {
      send({ type: Events.editIdentity });
    }
  };

  const handleCloseEdit = () => {
    setEditContent(undefined);
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'back', onClick: handlePrev }} />
      <Container>
        <HeaderTitle
          title={t('summary.title')}
          subtitle={t('summary.subtitle')}
        />
        <SectionsContainer>
          <EmailSection onEdit={handleEmailEdit} />
          <BasicInfoSection onEdit={handleBasicInfoEdit} />
          <AddressSection onEdit={handleAddressEdit} />
          <IdentitySection onEdit={handleIdentityEdit} />
        </SectionsContainer>
        <Button fullWidth onClick={handleConfirm} loading={isLoading}>
          {t('summary.cta')}
        </Button>
      </Container>
      <EditSheet
        open={!!editContent}
        onClose={handleCloseEdit}
        section={editContent}
      />
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[8]};
  `}
`;

const SectionsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default Confirm;
