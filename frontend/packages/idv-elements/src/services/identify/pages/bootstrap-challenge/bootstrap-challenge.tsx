import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import LegalFooter from '../../components/legal-footer';
import LoginChallenge from '../../components/login-challenge';
import useIdentifyMachine from '../../hooks/use-identify-machine';
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
      type: 'identifyReset',
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
