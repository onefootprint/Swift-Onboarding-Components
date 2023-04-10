import { Button as BaseButton } from '@react-email/button';
import * as React from 'react';

const Button = ({ href, label }) => {
  return (
    <BaseButton style={btn} href={href}>
      {label}
    </BaseButton>
  );
};

const btn = {
  backgroundColor: '#0E1438',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: '20px',
  padding: '10px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '0',
};

export default Button;
