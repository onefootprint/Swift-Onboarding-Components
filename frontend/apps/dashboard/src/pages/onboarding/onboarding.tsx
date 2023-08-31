import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { Container } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

import Form from './components/form';
import Header from './components/header';

const Onboarding = () => {
  const { t } = useTranslation('pages.onboarding');
  const router = useRouter();
  const session = useSession();

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleCompleted = () => {
    session.completeOnboarding();
    router.push('/users');
  };

  return session.data.user ? (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header userEmail={session.data.user.email} onLogout={handleLogout} />
      <Container>
        <Content>
          <Form onComplete={handleCompleted} />
        </Content>
      </Container>
    </>
  ) : null;
};

const Content = styled.div`
  --header-height: 60px;
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
`;

export default Onboarding;
