import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle, NavigationHeader } from '../../../../components';
import LoginChallenge from '../../components/login-challenge';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import SignupChallenge from './components/signup-challenge';

const Challenge = () => {
  const { t } = useTranslation('pages.challenge');
  const [state, send] = useIdentifyMachine();
  const { context } = state;
  const {
    identify: { userFound },
  } = context;

  const onNavigateToPrev = () => {
    send('navigatedToPrevPage');
  };

  return (
    <Container>
      <NavigationHeader
        button={{
          variant: 'back',
          onBack: onNavigateToPrev,
        }}
      />
      <HeaderTitle
        data-private
        title={userFound ? t('title.existing-user') : t('title.new-user')}
      />
      {userFound && <LoginChallenge />}
      {!userFound && <SignupChallenge />}
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

export default Challenge;
