import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import LinkButton from 'src/components/link-button';
import styled from 'styled-components';

type HeroProps = {
  cta: string;
  subtitle: string;
  title: string;
};

const Hero = ({ title, subtitle, cta }: HeroProps) => (
  <Container>
    <Typography
      variant="display-1"
      as="h1"
      sx={{ maxWidth: '830px', marginBottom: 5 }}
    >
      {title}
    </Typography>
    <Typography
      color="secondary"
      variant="display-4"
      as="h2"
      sx={{ maxWidth: '830px', marginBottom: 9 }}
    >
      {subtitle}
    </Typography>
    <LinkButton href={`${DASHBOARD_BASE_URL}/sign-up`}>{cta}</LinkButton>
  </Container>
);

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Hero;
