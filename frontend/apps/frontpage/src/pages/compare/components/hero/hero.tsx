import { Button, Typography } from '@onefootprint/ui';
import { createPopup } from '@typeform/embed';
import React from 'react';
import styled from 'styled-components';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

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
    <Button onClick={toggleTypeform} type="button">
      {cta}
    </Button>
  </Container>
);

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Hero;
