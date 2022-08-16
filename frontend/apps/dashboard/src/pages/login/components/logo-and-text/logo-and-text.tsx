import LogoFpDefault from 'icons/ico/logo-fp-default';
import React from 'react';
import styled from 'styled-components';
import { Typography } from 'ui';

export type LogoAndTextProps = {
  text: string;
};

const LogoAndText = ({ text }: LogoAndTextProps) => (
  <Container>
    <LogoFpDefault />
    <Typography variant="heading-3" color="primary" sx={{ marginY: 8 }}>
      {text}
    </Typography>
  </Container>
);

const Container = styled.div`
  text-align: center;
`;

export default LogoAndText;
