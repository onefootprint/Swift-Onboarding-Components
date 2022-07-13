import { createPopup } from '@typeform/embed';
import React from 'react';
import styled from 'styled-components';
import { Button, Typography } from 'ui';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

type HeroProps = {
  cta: string;
  subtitle: string;
  title: string;
};

const Hero = ({ title, subtitle, cta }: HeroProps) => (
  <Container>
    <Typography
      color="primary"
      variant="display-1"
      as="h1"
      sx={{ maxWidth: '700px', marginBottom: 5 }}
    >
      {title}
    </Typography>
    <Typography
      color="primary"
      variant="display-4"
      as="h2"
      sx={{ maxWidth: '830px', marginBottom: 9 }}
    >
      {subtitle}
    </Typography>
    <Button onClick={toggleTypeform} size="large" type="button">
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
