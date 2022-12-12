import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import Gradient from './components/gradient';

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
      <Gradient />
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
    position: relative;
    background: linear-gradient(
      180deg,
      #cbc1f6 0%,
      rgba(203, 193, 246, 0) 100%
    );
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
