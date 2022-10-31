import { useTranslation } from '@onefootprint/hooks';
import { KycStatus, StartKycResponse } from '@onefootprint/types';
import { Button, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import NavigationHeader from '../../../../components/navigation-header';
import { useGetKycStatus, useOnboardingSubmit } from '../../../../hooks';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import EditSheet, { EditSection } from './components/edit-sheet';
import IdentitySection from './components/identity-section';

const Confirm = () => {
  const { t } = useTranslation('pages.confirm');
  const [state, send] = useCollectKycDataMachine();
  const { authToken, data, tenant, kycPending, device } = state.context;
  const isMobile = device?.type === 'mobile';
  const [editContent, setEditContent] = useState<EditSection | undefined>();
  const { mutation, syncData } = useSyncData();
  const startKycMutation = useOnboardingSubmit();
  const toast = useToast();

  const handleError = () => {
    toast.show({
      title: t('error.title'),
      description: t('error.description'),
      variant: 'error',
    });
  };

  const handleKycSuccess = (status: KycStatus) => {
    const isDone =
      status === KycStatus.canceled ||
      status === KycStatus.failed ||
      status === KycStatus.completed;
    send({
      type: Events.confirmed,
      payload: {
        kycPending: !isDone,
      },
    });
  };

  const kycStatusPollingEnabled = !!kycPending;
  useGetKycStatus(kycStatusPollingEnabled, authToken ?? '', tenant?.pk ?? '', {
    onSuccess: response => handleKycSuccess(response.status),
    onError: handleError,
  });

  const handleSyncSuccess = () => {
    if (!tenant || !authToken) {
      return;
    }
    // Once data is synced to user vault, we need to start the kyc check
    startKycMutation.mutate(
      { authToken, tenantPk: tenant.pk },
      {
        onSuccess: (response: StartKycResponse) =>
          handleKycSuccess(response.status),
        onError: handleError,
      },
    );
  };

  const handleConfirm = () => {
    if (!authToken) {
      return;
    }
    syncData(authToken, data, {
      speculative: false,
      onSuccess: handleSyncSuccess,
      onError: handleError,
    });
  };

  const handlePrev = () => {
    send({ type: Events.navigatedToPrevPage });
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
          <BasicInfoSection onEdit={handleBasicInfoEdit} />
          <AddressSection onEdit={handleAddressEdit} />
          <IdentitySection onEdit={handleIdentityEdit} />
        </SectionsContainer>
        <Button fullWidth onClick={handleConfirm} loading={mutation.isLoading}>
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
    row-gap: ${theme.spacing[8]}px;
  `}
`;

const SectionsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[5]}px;
  `}
`;

export default Confirm;
