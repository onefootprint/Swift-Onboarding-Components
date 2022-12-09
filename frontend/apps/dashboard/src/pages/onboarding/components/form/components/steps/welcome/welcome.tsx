import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

export type WelcomeProps = {
  id: string;
  onComplete: () => void;
};

const Welcome = ({ id, onComplete }: WelcomeProps) => {
  const { t } = useTranslation('pages.onboarding.welcome');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <Container>
      <form id={id} onSubmit={handleSubmit}>
        <ImageContainer>
          <StyledImage
            alt={t('img-alt')}
            height={201}
            src="/onboarding/penguin.png"
            width={150}
          />
        </ImageContainer>
        <Typography variant="heading-3">{t('title')}</Typography>
        <Typography color="secondary" variant="body-1">
          {t('subtitle')}
        </Typography>
      </form>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[9]} ${theme.spacing[7]};
  `}
`;

const ImageContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]};
  `}
`;

export default Welcome;
