import { useTranslation } from '@onefootprint/hooks';
import Head from 'next/head';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';

import Form from './components/form';
import LoggedUser from './components/logged-user';

const Onboarding = () => {
  const { t } = useTranslation('pages.onboarding');
  const { dangerouslyData } = useSessionUser();

  const handleCompleted = () => {
    // TODO: FP-2132
    // https://linear.app/footprint/issue/FP-2132/dashboard-onboarding-complete-ob-flow-and-redirect-to
  };

  const handleSkip = () => {
    // TODO: FP-2132
    // https://linear.app/footprint/issue/FP-2132/dashboard-onboarding-complete-ob-flow-and-redirect-to
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container data-testid="onboarding-page">
        <Form onComplete={handleCompleted} onSkip={handleSkip} />
        <LoggedUser email={dangerouslyData.email} />
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
