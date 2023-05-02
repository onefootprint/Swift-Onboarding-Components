import { CollectedKycDataOption } from '@onefootprint/types';
import { Box, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import SharingInfo from './components/sharing-info';

const Sharing = () => {
  const sharing = [
    {
      name: 'Robinhood',
      logo: 'https://logo.clearbit.com/robinhood.com',
      fields: [
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
        CollectedKycDataOption.phoneNumber,
      ],
    },
    {
      name: 'Wealthfront',
      logo: 'https://logo.clearbit.com/wealthfront.com',
      fields: [
        CollectedKycDataOption.email,
        CollectedKycDataOption.name,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.ssn9,
        CollectedKycDataOption.phoneNumber,
      ],
    },
  ];

  return (
    <Container scroll>
      <Typography variant="body-2" marginBottom={7}>
        Companies and information you authorized them to read from your vault.
      </Typography>
      <Box gap={4}>
        {sharing.map(item => (
          <SharingInfo
            key={item.name}
            name={item.name}
            logo={item.logo}
            fields={item.fields}
          />
        ))}
      </Box>
    </Container>
  );
};

export default Sharing;
