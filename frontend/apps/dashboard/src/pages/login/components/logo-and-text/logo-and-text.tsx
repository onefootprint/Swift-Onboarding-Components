import { LogoFpDefault } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

export type LogoAndTextProps = {
  text: string;
};

const LogoAndText = ({ text }: LogoAndTextProps) => (
  <Container>
    <LogoFpDefault />
    <Typography variant="label-1" color="primary" sx={{ marginY: 8 }}>
      {text}
    </Typography>
  </Container>
);

const Container = styled.div`
  text-align: center;
`;

export default LogoAndText;
