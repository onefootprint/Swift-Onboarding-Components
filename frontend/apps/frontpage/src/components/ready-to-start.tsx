import React from 'react';
import { Button, Container, Typography } from 'ui';

type FooterProps = {
  titleText: string;
  subtitleText: string;
  ctaText: string;
};

const Footer = ({ titleText, subtitleText, ctaText }: FooterProps) => (
  <Container>
    <Typography variant="display-1" color="primary" as="p">
      {titleText}
    </Typography>
    <Typography variant="display-4" color="secondary" as="p">
      {subtitleText}
    </Typography>
    <Button>{ctaText}</Button>
  </Container>
);

export default Footer;
