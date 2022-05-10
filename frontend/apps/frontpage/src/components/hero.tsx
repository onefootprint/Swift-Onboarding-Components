import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Button, Container, Typography } from 'ui';

type HeroProps = {
  titleText: string;
  subtitleText: string;
  ctaText: string;
  imageAltText: string;
};

const Hero = ({
  titleText,
  subtitleText,
  ctaText,
  imageAltText,
}: HeroProps) => (
  <Container as="section">
    <Inner>
      <Typography
        as="h1"
        color="primary"
        sx={{
          marginBottom: 5,
          maxWidth: '700px',
        }}
        variant="display-1"
      >
        {titleText}
      </Typography>
      <Typography
        as="h2"
        color="secondary"
        sx={{ marginBottom: 9 }}
        variant="body-1"
      >
        {subtitleText}
      </Typography>
      <Button>{ctaText}</Button>
    </Inner>
    <Image
      alt={imageAltText}
      height={682}
      layout="responsive"
      priority
      quality={100}
      src="/images/hero.png"
      width={1280}
    />
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto ${theme.spacing[10]}px;
    max-width: 780px;
    text-align: center;
  `}
`;

export default Hero;
