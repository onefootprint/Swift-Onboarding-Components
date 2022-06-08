import footprint from 'footprint';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Box, Container, FootprintButton, media, Typography } from 'ui';

const footprintInstance = footprint.init({ publicKey: 'lorem' });

const Root = () => {
  const handleClick = async () => {
    await footprintInstance.show();
  };

  return (
    <Container>
      <Inner>
        <Box sx={{ marginBottom: 10 }}>
          <Image
            src="/logo-acme-bank.png"
            width={187}
            height={40}
            layout="fixed"
            priority
          />
        </Box>
        <Box sx={{ marginBottom: 9 }}>
          <Image
            src="/puzzle.gif"
            width={332}
            height={249}
            layout="fixed"
            priority
          />
        </Box>
        <Typography
          color="primary"
          variant="heading-3"
          sx={{ marginBottom: 5 }}
        >
          Help us verify your identity
        </Typography>
        <Typography color="secondary" variant="body-1" sx={{ marginBottom: 9 }}>
          We ll need to collect some personal information to confirm and protect
          your identity when you create your account at AcmeBank. To learn more
          about how we process this data, please see our privacy policy.
        </Typography>
        <FootprintButton onClick={handleClick} />
      </Inner>
    </Container>
  );
};

const Inner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  margin: 0 auto;
  text-align: center;
  width: 480px;

  ${media.greaterThan('md')`
    width: 620px;
  `}
`;

export default Root;
