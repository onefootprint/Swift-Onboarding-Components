import { Container } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';

import Form from './components/form';
import Header from './components/header';

const Onboarding = () => {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const session = useSession();

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleCompleted = () => {
    session.completeOnboarding();
    // TODO: Redirect back to DEFAULT_PUBLIC_ROUTE
    router.push('/users');
  };

  return session.data.user ? (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <>
        <Header userEmail={session.data.user.email} onLogout={handleLogout} />
        <Content>
          <Container>
            <Form onComplete={handleCompleted} />
          </Container>
        </Content>
      </>
    </>
  ) : null;
};

const Content = styled.div`
  --header-height: 60px;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
`;

export default Onboarding;
