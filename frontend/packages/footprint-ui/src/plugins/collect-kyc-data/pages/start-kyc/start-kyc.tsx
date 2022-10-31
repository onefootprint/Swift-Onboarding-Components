import { useTranslation } from '@onefootprint/hooks';
import { KycStatus, StartKycResponse } from '@onefootprint/types';
import { LoadingIndicator, useToast } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useGetKycStatus, useOnboardingSubmit } from '../../../../hooks';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';

const StartKyc = () => {
  const { t } = useTranslation('pages.confirm');
  const [state, send] = useCollectKycDataMachine();
  const { tenant, kycPending, authToken } = state.context;
  const startKycMutation = useOnboardingSubmit();
  const toast = useToast();

  useEffectOnce(() => {
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
  });

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

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const Container = styled.div`
  flex-direction: column;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default StartKyc;
