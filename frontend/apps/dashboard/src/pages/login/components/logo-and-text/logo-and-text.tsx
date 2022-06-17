import React from 'react';
import styled from 'styled-components';
import { FootprintLogo, Typography } from 'ui';

export type LogoAndTextProps = {
  text: string;
};

const LogoAndText = ({ text }: LogoAndTextProps) => (
  <Container>
    <FootprintLogo />
    <Typography variant="heading-3" color="primary" sx={{ marginY: 8 }}>
      {text}
    </Typography>
  </Container>
);

const Container = styled.div`
  text-align: center;
`;

export default LogoAndText;
