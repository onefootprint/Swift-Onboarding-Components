import { Container } from '@react-email/container';
import { Text } from '@react-email/text';
import * as React from 'react';

const Title = ({ title, body }) => {
  return (
    <Container style={message}>
      <Text style={h1}>{title}</Text>
      <Text style={text}>{body}</Text>
    </Container>
  );
};

const h1 = {
  color: '#000',
  fontSize: '19px',
  fontWeight: 700,
  lineHeight: '28px',
  textAlign: 'center' as const,
  margin: '0',
};

const text = {
  color: '#2D2D2D',
  textAlign: 'center' as const,
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const message = {
  alignItems: 'center',
  gap: '16px',
  margin: '32px 0',
  maxWidth: '436px',
  width: '80%',
};

export default Title;
