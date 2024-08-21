import { Button, Text, media } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import WelcomeIllustration from './componens/welcome-illustration';

export type WelcomeProps = {
  onComplete: () => void;
};

const Welcome = ({ onComplete }: WelcomeProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.onboarding.welcome',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <WelcomeIllustration />
      <TitleContainer>
        <Text variant="heading-3">{t('title')}</Text>
      </TitleContainer>
      <Text color="secondary" variant="body-2">
        {t('subtitle')}
      </Text>
      <ButtonContainer>
        <Button type="submit" fullWidth>
          {allT('next')}
        </Button>
      </ButtonContainer>
    </Form>
  );
};

const Form = styled.form`
  text-align: center;

  ${media.greaterThan('md')`
    text-align: left;
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[8]} 0 ${theme.spacing[3]} 0;
  `}
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
  `}
`;

export default Welcome;
