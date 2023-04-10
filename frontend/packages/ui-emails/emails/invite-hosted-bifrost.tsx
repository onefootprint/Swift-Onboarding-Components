import { Container as BaseContainer } from '@react-email/container';
import { Head } from '@react-email/head';
import { Html } from '@react-email/html';

import { Img } from '@react-email/img';

import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';
import * as React from 'react';

import { Button as BaseButton } from '@react-email/button';

import { Link } from '@react-email/link';
import { Text } from '@react-email/text';

const name = 'John Doe';
const businessName = 'Acme Inc.';
const flowLink = 'https://footprint.com/verify-email';
const logoUrl = '/static/fractional.png';

const content = {
  title:
    'A business you own is being verified and you need to verify your identity as one of its owners.',
  description: `${name} is verifying ${businessName}, and you were identified as a beneficial owner. For it to be successfully verified you need to verify your identity.`,
  button: {
    label: 'Verify your identity',
    href: `${flowLink}`,
  },
  copyLink: {
    content: 'Or copy and paste this link into your browser:',
    href: 'https://www.onefootprint.com/confirmation/XjasoI1k2',
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
            <Img
              src={logoUrl}
              width="40"
              height="40"
              alt={businessName}
              style={logo}
            />
          </Section>
          <BaseContainer style={messageContainer}>
            <Text style={h1}>{content.title}</Text>
            <Text style={text}>{content.description}</Text>
          </BaseContainer>
          <BaseButton href={content.button.href} style={btn}>
            {content.button.label}
          </BaseButton>
          <BaseContainer style={copyLinkContainer}>
            <Text style={text}>{content.copyLink.content}</Text>
            <Link href={content.copyLink.href} style={hyperlink}>
              {content.copyLink.href}
            </Link>
          </BaseContainer>
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

const btn = {
  backgroundColor: '#0E1438',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 500,
  paddingTop: '10px',
  paddingBottom: '10px',
  paddingLeft: '20px',
  paddingRight: '20px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '0',
};

const emailContainer = {
  border: '1px solid #E2E2E2',
  backgroundColor: '#fff',
  borderRadius: '5px',
  margin: '32px auto 40px auto',
  padding: '20px',
  width: '70%',
  textAlign: 'center' as const,
};

const copyLinkContainer = {
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px auto',
};

const logo = {
  margin: '0 auto',
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
