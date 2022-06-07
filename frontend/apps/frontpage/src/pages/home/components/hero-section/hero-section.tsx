import { useTranslation } from 'hooks';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, Container, media, Typography } from 'ui';

type HeroSectionProps = {
  onCtaClick: () => void;
};

const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  const { t } = useTranslation('pages.home.hero');
  return (
    <Container as="section" id="hero">
      <ContentContainer>
        <Typography
          as="h1"
          color="primary"
          sx={{
            marginBottom: 5,
            maxWidth: '700px',
          }}
          variant="display-1"
        >
          {t('title')}
        </Typography>
        <Typography
          as="h2"
          color="secondary"
          sx={{ marginBottom: 9, maxWidth: '830px' }}
          variant="display-4"
        >
          {t('subtitle')}
        </Typography>
        <Button size="large" onClick={onCtaClick}>
          {t('cta')}
        </Button>
      </ContentContainer>
      <ImageContainer>
        <SmallImageContainer>
          <Image
            alt={t('imgAlt')}
            height={371}
            layout="responsive"
            src="/hero/hero-mobile.png"
            width={320}
            priority
          />
        </SmallImageContainer>
        <LargeImageContainer>
          <Image
            alt={t('imgAlt')}
            height={682}
            layout="responsive"
            src="/hero/hero-desktop.png"
            width={1280}
            priority
          />
        </LargeImageContainer>
      </ImageContainer>
    </Container>
  );
};

const ContentContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto ${theme.spacing[10]}px;
    text-align: center;
  `}
`;

const ImageContainer = styled.div`
  text-align: center;

  img {
    width: 100%;
    object-fit: contain;
  }
`;

const SmallImageContainer = styled.div`
  ${media.greaterThan('sm')`
    display: none;
  `}
`;

const LargeImageContainer = styled.div`
  display: none;

  ${media.greaterThan('sm')`
    display: block;
  `}
`;

export default HeroSection;
