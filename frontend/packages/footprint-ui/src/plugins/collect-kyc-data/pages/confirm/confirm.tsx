import { useTranslation } from '@onefootprint/hooks';
import {
  GetKycStatusResponse,
  KycStatus,
  StartKycResponse,
} from '@onefootprint/types';
import { Button, useToast } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import { useCollectKycDataMachine } from '../../components/machine-provider';
import NavigationHeader from '../../components/navigation-header';
import useSyncData from '../../hooks/use-sync-data';
import { Events } from '../../utils/state-machine/types';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import IdentitySection from './components/identity-section';
import useGetKycStatus from './hooks/use-get-kyc-status';
import useStartKyc from './hooks/use-start-kyc';

const Confirm = () => {
  const { t } = useTranslation('pages.confirm');
  const [state, send] = useCollectKycDataMachine();
  const { authToken, data, tenant } = state.context;
  const { mutation, syncData } = useSyncData();
  const startKycMutation = useStartKyc();
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

  useGetKycStatus({
    onSuccess: (response: GetKycStatusResponse) =>
      handleKycSuccess(response.status),
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

  return (
    <>
      <NavigationHeader />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <SectionsContainer>
          <BasicInfoSection />
          <AddressSection />
          <IdentitySection />
        </SectionsContainer>
        <Button fullWidth onClick={handleConfirm} loading={mutation.isLoading}>
          {t('cta')}
        </Button>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

const SectionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default Confirm;
