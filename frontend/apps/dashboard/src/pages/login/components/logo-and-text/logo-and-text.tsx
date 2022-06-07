import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Typography } from 'ui';

export type LogoAndTextProps = {
  text: string;
};

const LogoAndText = ({ text }: LogoAndTextProps) => (
  <Container>
    <Image
      alt="Footprint"
      height={26}
      layout="fixed"
      priority
      src="/images/logo.png"
      width={120}
    />
    <Typography variant="heading-3" color="primary" sx={{ marginY: 8 }}>
      {text}
    </Typography>
  </Container>
);

const Container = styled.div`
  text-align: center;
`;

export default LogoAndText;
