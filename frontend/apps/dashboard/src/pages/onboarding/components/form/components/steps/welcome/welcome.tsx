import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

export type WelcomeProps = {
  onComplete: () => void;
};

const Welcome = ({ onComplete }: WelcomeProps) => {
  const { t, allT } = useTranslation('pages.onboarding.welcome');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <StyledImage
        alt={t('img-alt')}
        height={178}
        priority
        src="/onboarding/penguin.png"
        width={137}
      />
      <TitleContainer>
        <Typography variant="heading-3">{t('title')}</Typography>
      </TitleContainer>
      <Typography color="secondary" variant="body-2">
        {t('subtitle')}
      </Typography>
      <ButtonContainer>
        <Button size="compact" type="submit" fullWidth>
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

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]};
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
  `}
`;

export default Welcome;
