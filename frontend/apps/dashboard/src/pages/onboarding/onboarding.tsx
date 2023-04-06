import { useTranslation } from '@onefootprint/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';

import Form from './components/form';
import LoggedUser from './components/logged-user';

const Onboarding = () => {
  const { t } = useTranslation('pages.onboarding');
  const router = useRouter();
  const session = useSession();

  const handleCompleted = () => {
    session.completeOnboarding();
    router.push('/users');
  };

  return session.data.user ? (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <Form onComplete={handleCompleted} />
        <LoggedUser email={session.data.user.email} />
      </Container>
    </>
  ) : null;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Onboarding;
