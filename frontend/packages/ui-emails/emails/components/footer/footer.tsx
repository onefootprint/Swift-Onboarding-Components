import { Container } from '@react-email/container';
import { Text } from '@react-email/text';
import * as React from 'react';

const content = {
  address: '201 Varick St FRNT 1 #1016, New York NY 10014',
};

const Footer = () => {
  return (
    <Container style={footer}>
      <Text style={footerText}>{content.address}</Text>
      <Text style={footerText}>
        © {new Date().getFullYear()} One Footprint Inc.
      </Text>
    </Container>
  );
};

const footer = {
  width: '100%',
  padding: '24px 0 8px 0',
  borderTop: '1px solid #E2E2E2',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8D8D8D',
  textAlign: 'center' as const,
  margin: '0',
};

export default Footer;
