import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import LegalFooter from 'src/pages/identify/components/legal-footer';
import LoginChallenge from 'src/pages/identify/components/login-challenge';
import useIdentifyMachine, {
  Events,
} from 'src/pages/identify/hooks/use-identify-machine';
import styled, { css } from 'styled-components';

import LoginWithDifferentAccount from './components/login-with-different-account';

const BootstrapChallenge = () => {
  const { t } = useTranslation('pages.bootstrap-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    bootstrapData,
    identify: { successfulIdentifier },
    config,
  } = state.context;

  const showMissingPhoneLabel =
    successfulIdentifier && 'email' in successfulIdentifier;

  const handleLoginWithDifferent = () => {
    send({
      type: Events.identifyReset,
    });
  };

  return (
    <Container>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle
        data-private
        title={t('title')}
        subtitle={t('subtitle', { tenantName: config?.orgName })}
      />
      <LoginChallenge />
      <LegalFooter />
      {bootstrapData && (
        <LoginWithDifferentAccount
          showMissingPhoneLabel={showMissingPhoneLabel}
          onClick={handleLoginWithDifferent}
        />
      )}
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

export default BootstrapChallenge;
