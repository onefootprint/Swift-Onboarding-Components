import React from 'react';
import styled, { css } from 'styled';
import { Button, Container, Typography } from 'ui';

type HeroSectionProps = {
  title: string;
  subtitle: string;
  cta: string;
  imgAlt: string;
};

const HeroSection = ({ title, subtitle, cta, imgAlt }: HeroSectionProps) => (
  <Container as="section" id="section">
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
        sx={{ marginBottom: 9 }}
        variant="display-4"
      >
        {subtitle}
      </Typography>
      <Button size="large">{cta}</Button>
    </ContentContainer>
    <ImageContainer>
      <picture>
        <source
          height={371}
          media="(min-width: 0px) and (max-width: 360)"
          srcSet="/images/hero-xs.png"
          width={320}
        />
        <source
          height={303}
          media="(min-width: 600px) and (max-width: 900px)"
          srcSet="/images/hero-sm.png"
          width={552}
        />
        <source
          height={469}
          media="(min-width: 900px) and (max-width: 1200px)"
          srcSet="/images/hero-md.png"
          width={852}
        />
        <source
          height={627}
          media="(min-width: 1200) and (max-width: 1440)"
          srcSet="/images/hero-lg.png"
          width={1120}
        />
        <img src="/images/hero.png" alt={imgAlt} height={682} width={1280} />
      </picture>
    </ImageContainer>
  </Container>
);

const ContentContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto ${theme.spacing[10]}px;
    max-width: 781px;
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

export default HeroSection;
