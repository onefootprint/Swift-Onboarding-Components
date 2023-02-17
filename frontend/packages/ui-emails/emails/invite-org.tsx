import { Container as BaseContainer } from '@react-email/container';
import { Head } from '@react-email/head';
import { Html } from '@react-email/html';

import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';

import * as React from 'react';

import Button from './components/button';

import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import { Img } from '@react-email/img';

const content = {
  title: 'Elliot has invited you to collaborate on Ramp`s organization',
  body: 'You can accept or decline this invitation by clicking the button below.',
  button: {
    label: 'View invitation',
    href: 'https://onefootprint.com/',
  },
  note: 'Note: This invitation was intended for elliotfiorde@onefootprint.com. If you were not expecting this invitation, please ignore this email.',
  address: '158 W 23rd St Apt 7 New York New York 10011',
};

const InviteOrg = () => {
  return (
    <Html>
      <Head />
      <Preview>{content.title}</Preview>
      <Section style={main}>
        <BaseContainer style={emailContainer}>
          <Container style={logosContainer}>
            <Img
              src="/static/ico-footprint-40.svg"
              width="100"
              height="21"
              alt="Footprint"
              style={logoCircularFp}
            />
            <Img
              src="/static/ico-ramp-40.svg"
              width="100"
              height="21"
              alt="Footprint"
              style={logoCircularPartner}
            />
          </Container>
          <BaseContainer style={messageContainer}>
            <Text style={h1}>{content.title}</Text>
            <Text style={text}>{content.body}</Text>
          </BaseContainer>
          <Button href={content.button.href} label={content.button.label} />
          <BaseContainer style={messageContainer}>
            <Text style={textSecondary}>{content.note}</Text>
          </BaseContainer>
          <Container style={footer}>
            <Text style={footerText}>{content.address}</Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} One Footprint Inc.
            </Text>
          </Container>
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
};

const emailContainer = {
  border: '1px solid #E2E2E2',
  backgroundColor: '#fff',
  borderRadius: '5px',
  margin: '40px auto',
  padding: '16px',
  width: '80%',
  textAlign: 'center' as const,
};

const messageContainer = {
  gap: '16px',
  textAlign: 'center' as const,
  margin: '32px auto',
  width: '85%',
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
  color: '#2D2D2D',
  textAlign: 'center' as const,
  fontSize: '14px',
  lineHeight: '24px',
  margin: 'auto',
};

const textSecondary = {
  color: '#8D8D8D',
  textAlign: 'center' as const,
  fontSize: '12px',
  lineHeight: '16px',
  margin: 'auto',
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

const logoCircularFp = {
  padding: '8px',
  borderRadius: '50%',
  backgroundColor: '#fff',
  border: '1px solid #E2E2E2',
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)',
  width: 'fit-content',
  position: 'absolute',
  transform: 'translateX(-50%)',
  left: '47%',
};

const logoCircularPartner = {
  padding: '8px',
  borderRadius: '50%',
  backgroundColor: '#fff',
  border: '1px solid #E2E2E2',
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)',
  width: 'fit-content',
  position: 'absolute',
  transform: 'translateX(-50%)',
  left: '53%',
};

const logosContainer = {
  position: 'relative',
  height: '40px',
  padding: '24px 0 0 0',
};

export default InviteOrg;
