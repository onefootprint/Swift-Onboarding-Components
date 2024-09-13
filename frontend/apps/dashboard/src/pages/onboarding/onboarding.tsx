import { Container } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';

import { useState } from 'react';
import Form from './components/form';
import Header from './components/header';
import Takeover from './components/takeover';
import { useGetInProgressOnboardings } from './hooks/use-get-in-progress-onboardings';

const Onboarding = () => {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const session = useSession();
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const authToken = session.authHeaders['x-fp-dashboard-authorization'] || '';
  const { data: inProgressOnboardings } = useGetInProgressOnboardings({ authToken });
  const shouldShowTakeover = inProgressOnboardings && inProgressOnboardings.length > 0 && !hasShownWarning;

  const handleConfirm = () => {
    setHasShownWarning(true);
  };

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleCompleted = () => {
    session.completeOnboarding();
    // TODO: Redirect back to DEFAULT_PUBLIC_ROUTE
    router.push('/users');
  };

  // even if inProgressOnboardings is empty ([]) it will be truthy
  return session.data.user && !!inProgressOnboardings ? (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      {shouldShowTakeover ? (
        <Takeover inProgressOnboardings={inProgressOnboardings} onConfirm={handleConfirm} />
      ) : (
        <>
          <Header userEmail={session.data.user.email} onLogout={handleLogout} />
          <Content>
            <Container>
              <Form onComplete={handleCompleted} />
            </Container>
          </Content>
        </>
      )}
    </>
  ) : null;
};

const Content = styled.div`
  --header-height: 60px;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
`;

export default Onboarding;
