import {
  useGetKycStatus,
  useOnboardingSubmit,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { KycStatus } from '@onefootprint/types';
import { LoadingIndicator, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { OnboardingRequirementsMachineContext } from 'src/utils/state-machine/onboarding-requirements';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useOnboardingRequirementsMachine, {
  Events,
} from '../../hooks/use-onboarding-requirements-machine';

const IdentityCheck = () => {
  const { t } = useTranslation('pages.identity-check');
  const [kycPending, setKycPending] = useState(false);
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { tenant, authToken },
  }: OnboardingRequirementsMachineContext = state.context;
  const startKycMutation = useOnboardingSubmit();
  const toast = useToast();

  useEffectOnce(() => {
    if (!tenant || !authToken) {
      return;
    }
    startKycMutation.mutate(
      { authToken, tenantPk: tenant.pk },
      {
        onSuccess: () => {
          setKycPending(true);
        },
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

  const handleKycStatus = (status: KycStatus) => {
    const isDone =
      status === KycStatus.canceled ||
      status === KycStatus.failed ||
      status === KycStatus.completed;

    if (isDone) {
      send({
        type: Events.requirementCompleted,
      });
    }
  };

  useGetKycStatus(kycPending, authToken ?? '', tenant?.pk ?? '', {
    onSuccess: response => handleKycStatus(response.status),
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

export default IdentityCheck;
