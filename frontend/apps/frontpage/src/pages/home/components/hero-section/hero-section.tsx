import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Button, Container, media, Typography } from 'ui';

type HeroSectionProps = {
  title: string;
  subtitle: string;
  cta: string;
  imgAlt: string;
};

const HeroSection = ({ title, subtitle, cta, imgAlt }: HeroSectionProps) => (
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
        {title}
      </Typography>
      <Typography
        as="h2"
        color="secondary"
        sx={{ marginBottom: 9, maxWidth: '830px' }}
        variant="display-4"
      >
        {subtitle}
      </Typography>
      <Button size="large">{cta}</Button>
    </ContentContainer>
    <ImageContainer>
      <SmallImageContainer>
        <Image
          alt={imgAlt}
          height={371}
          layout="fixed"
          src="/images/hero-xs.png"
          width={320}
        />
      </SmallImageContainer>
      <LargeImageContainer>
        <Image
          alt={imgAlt}
          height={682}
          layout="responsive"
          src="/images/hero.png"
          width={1280}
        />
      </LargeImageContainer>
    </ImageContainer>
  </Container>
);

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
