import 'footprint';

import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Box, media, Typography } from 'ui';

const TENANT_KEY = process.env.NEXT_PUBLIC_TENANT_KEY;

const Root = () => (
  <Inner>
    <script
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: `
          window.onFootprintCompleted = (footprintUserId) => {
            alert(footprintUserId)
          }
          window.onFootprintCanceled = () => {
            alert('onFootprintCanceled')
          }
          window.onFootprintFailed = () => {
            alert('onFootprintFailed')
          }
        `,
      }}
    />
    <Box sx={{ marginBottom: 10 }}>
      <Image
        src="/logo-acme-bank.png"
        width={187}
        height={40}
        layout="fixed"
        priority
      />
    </Box>
    <Box sx={{ marginBottom: 10 }}>
      <Image
        src="/puzzle.gif"
        width={285}
        height={214}
        layout="fixed"
        priority
      />
    </Box>
    <Typography color="primary" variant="heading-3" sx={{ marginBottom: 5 }}>
      Help us verify your identity
    </Typography>
    <Typography color="secondary" variant="body-1" sx={{ marginBottom: 9 }}>
      We will need to collect some personal information to confirm and protect
      your identity when you create your account at AcmeBank. To learn more
      about how we process this data, please see our privacy policy.
    </Typography>
    <div id="footprint-button" data-public-key={TENANT_KEY} />
  </Inner>
);

const Inner = styled.div`
  align-items: center;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  margin: 0 auto;
  max-width: 480px;
  padding: 0 16px;
  text-align: center;

  ${media.greaterThan('md')`
    width: 620px;
  `}
`;

export default Root;
