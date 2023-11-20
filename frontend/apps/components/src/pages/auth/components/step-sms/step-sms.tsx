import { useTranslation } from '@onefootprint/hooks';
import { getCanChallengeBiometrics } from '@onefootprint/idv-elements';
import styled, { css } from '@onefootprint/styled';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import { useAuthMachine } from '../../state';
import PinVerification from '../pin-verification';
import StepHeader from '../step-header';
import { getFormTitle, getStepTitle } from './utils';

type StepPhoneProps = { children?: JSX.Element | null };

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const StepSms = ({ children }: StepPhoneProps) => {
  const [state, send] = useAuthMachine();
  const {
    bootstrapData,
    config: { logoUrl, orgName },
    challenge: { challengeData, hasSyncablePassKey, availableChallengeKinds },
    device,
    identify,
    showLogo,
  } = state.context;
  const { phoneNumber = '', successfulIdentifier } = identify;
  const { t } = useTranslation('pages.auth');
  const toast = useToast();

  const isBootstrap = !!(bootstrapData?.email || bootstrapData?.phoneNumber);
  const headerTitle = getStepTitle(t, identify);
  const formTitle = getFormTitle(t, challengeData, identify);

  const shouldShowBack =
    !isBootstrap ||
    getCanChallengeBiometrics(
      availableChallengeKinds,
      hasSyncablePassKey,
      device,
    );

  const handleChallengeSucceed = (authToken: string) => {
    setTimeout(() => {
      send({ type: 'challengeSucceeded', payload: { authToken } });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  const handleNewChallengeRequested = () => {
    toast.show({
      title: t('pin-verification.success'),
      description: t('pin-verification.new-code-sent-description'),
    });
  };

  const handleBack = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  return (
    <Container>
      <StepHeader
        data-private
        leftButton={
          shouldShowBack
            ? { variant: 'back', onBack: handleBack }
            : { variant: 'close' }
        }
        logoUrl={logoUrl ?? undefined}
        orgName={orgName}
        showLogo={showLogo}
        title={headerTitle}
      />
      <PinVerification
        identifier={successfulIdentifier ?? { phoneNumber }}
        onChallengeSucceed={handleChallengeSucceed}
        onNewChallengeRequested={handleNewChallengeRequested}
        preferredChallengeKind={ChallengeKind.sms}
        title={formTitle}
      />
      {children}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[7]};
  `}
`;

export default StepSms;
