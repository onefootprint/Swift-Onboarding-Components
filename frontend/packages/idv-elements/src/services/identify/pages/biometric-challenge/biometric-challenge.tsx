import { useTranslation } from '@onefootprint/hooks';
import { IcoSmartphone24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, Divider, LinkButton } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import LegalFooter from '../../components/legal-footer';
import Logo from '../../components/logo';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import Biometric from './components/biometric';

const BiometricChallenge = () => {
  const { t } = useTranslation('pages.biometric-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    config,
    bootstrapData,
    identify: { userFound },
    showLogo,
  } = state.context;
  const isBootstrap = bootstrapData?.email || bootstrapData?.phoneNumber;
  const title = t('title');
  const logoUrl = config?.logoUrl;
  const orgName = config?.orgName;
  const subtitle =
    isBootstrap && userFound
      ? t('bootstrap-subtitle', { tenantName: config?.orgName })
      : t('subtitle');

  const handleLoginWithDifferent = () => {
    send({
      type: 'identifyReset',
    });
  };

  const handleBack = () => {
    send({
      type: 'navigatedToPrevPage',
    });
  };

  const handleChangeChallenge = () => {
    send({
      type: 'changeChallengeToSms',
    });
  };

  return (
    <Container>
      <NavigationHeader
        button={
          isBootstrap
            ? { variant: 'close' }
            : { variant: 'back', onBack: handleBack }
        }
      />
      <ContentHeader>
        {showLogo && orgName && (
          <Logo orgName={orgName} logoUrl={logoUrl ?? undefined} />
        )}
        <HeaderTitle data-private title={title} subtitle={subtitle} />
      </ContentHeader>
      <Biometric />
      <StyledDivider />
      <Button
        fullWidth
        variant="secondary"
        onClick={handleChangeChallenge}
        prefixIcon={IcoSmartphone24}
      >
        {t('login-with-sms')}
      </Button>
      {isBootstrap && (
        <>
          <LinkButton onClick={handleLoginWithDifferent}>
            {t('login-with-different-account')}
          </LinkButton>
          <LegalFooter />
        </>
      )}
    </Container>
  );
};

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    border-style: dashed;
    border-color: ${theme.borderColor.tertiary};
    background: none;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[7]};
  `}
`;

const ContentHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default BiometricChallenge;
