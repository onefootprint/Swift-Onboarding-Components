import { Container as BaseContainer } from '@react-email/container';
import { Head } from '@react-email/head';
import { Html } from '@react-email/html';

import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';
import * as React from 'react';

import Button from './components/button';
import FootprintLogo from './components/logo';
import Footer from './components/footer';
import { Link } from '@react-email/link';
import { Text } from '@react-email/text';

const content = {
  title:
    'You asked us to send you a magic link for quickly signing in to your workspace.',
  button: {
    label: 'Sign-in to Footprint',
    href: 'https://footprint.com/verify-email',
  },
  copyLink: {
    content: 'Or copy and paste this link into your browser:',
    href: 'https://www.onefootprint.com/confirmation/XjasoI1k2',
    note: 'Note: your magic link will expire in 24 hours and can only be used one time.',
  },
};

const Email = () => {
  return (
    <Html>
      <Head />
      <Preview>{content.title}</Preview>
      <Section style={main}>
        <BaseContainer style={emailContainer}>
          <Section style={{ marginTop: '32px' }}>
            <FootprintLogo />
          </Section>
          <BaseContainer style={messageContainer}>
            <Text style={h1}>{content.title}</Text>
          </BaseContainer>
          <Button href={content.button.href} label={content.button.label} />
          <BaseContainer style={copyLinkContainer}>
            <Text style={text}>{content.copyLink.content}</Text>
            <Link href={content.copyLink.href} style={hyperlink}>
              {content.copyLink.href}
            </Link>
            <Text style={text}>{content.copyLink.note}</Text>
          </BaseContainer>
          <Footer />
        </BaseContainer>
      </Section>
    </Html>
  );
};

const main = {
  fontFamily: "'DM Sans',Helvetica, HelveticaNeue, Arial,sans-serif",
  backgroundColor: '#f5f5f5',
  padding: '32px 0',
  margin: '0 auto',
  width: '100%',
};

const emailContainer = {
  border: '1px solid #E2E2E2',
  backgroundColor: '#fff',
  borderRadius: '5px',
  margin: '40px auto',
  padding: '20px',
  width: '70%',
  textAlign: 'center' as const,
};

const copyLinkContainer = {
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px auto',
};

const hyperlink = {
  color: '#4A24DB',
  textDecoration: 'none',
  alignText: 'center' as const,
  overflowWrap: 'break-word' as const,
};

const messageContainer = {
  gap: '16px',
  textAlign: 'center' as const,
  width: '90%',
  margin: '32px auto',
};

const h1 = {
  color: '#000',
  fontSize: '19px',
  fontWeight: 700,
  lineHeight: '28px',
  textAlign: 'center' as const,
  margin: '0',
  marginBottom: '8px',
};

const text = {
  color: '#707070',
  textAlign: 'center' as const,
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

export default Email;
