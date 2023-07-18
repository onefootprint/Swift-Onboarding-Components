import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import LegalFooter from '../../components/legal-footer';
import Logo from '../../components/logo';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import { getCanChallengeBiometrics } from '../../utils/biometrics';
import Sms from './components/sms/sms';

const SmsChallenge = () => {
  const { t } = useTranslation('pages.sms-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    config,
    challenge,
    device,
    bootstrapData,
    identify: { userFound },
    showLogo,
  } = state.context;
  const isBootstrap = bootstrapData?.email || bootstrapData?.phoneNumber;
  const logoUrl = config?.logoUrl;
  const orgName = config?.orgName;
  const shouldShowBack =
    !isBootstrap || getCanChallengeBiometrics(challenge, device);
  const title = userFound ? t('welcome-back-title') : t('title');
  const subtitle =
    isBootstrap && userFound
      ? t('bootstrap-subtitle', { tenantName: config?.orgName })
      : t('subtitle');

  const handleBack = () => {
    send({
      type: 'navigatedToPrevPage',
    });
  };

  return (
    <Container>
      <NavigationHeader
        button={
          shouldShowBack
            ? { variant: 'back', onBack: handleBack }
            : { variant: 'close' }
        }
      />
      <ContentHeader>
        {showLogo && orgName && (
          <Logo orgName={orgName} logoUrl={logoUrl ?? undefined} />
        )}
        <HeaderTitle data-private title={title} subtitle={subtitle} />
      </ContentHeader>
      <Sms />
      {isBootstrap && <LegalFooter />}
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

const ContentHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default SmsChallenge;
