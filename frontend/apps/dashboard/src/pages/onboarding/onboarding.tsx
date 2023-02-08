import { useTranslation } from '@onefootprint/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { DEFAULT_LOGGED_IN_ROUTE } from 'src/config/constants';
import useSession from 'src/hooks/use-user-session';
import styled from 'styled-components';

import Form from './components/form';
import LoggedUser from './components/logged-user';

const Onboarding = () => {
  const { t } = useTranslation('pages.onboarding');
  const router = useRouter();
  const { dangerouslyCastedData } = useSession();

  const handleCompleted = () => {
    router.replace(DEFAULT_LOGGED_IN_ROUTE);
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container data-testid="onboarding-page">
        <Form onComplete={handleCompleted} />
        <LoggedUser email={dangerouslyCastedData.email} />
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Onboarding;
