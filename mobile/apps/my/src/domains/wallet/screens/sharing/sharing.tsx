import { Box, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import SharingInfo from './components/sharing-info';
import useSharing from './hooks/use-sharing';

const Sharing = () => {
  const { data } = useSharing();

  if (data) {
    return (
      <Container scroll>
        <Typography variant="body-2" marginBottom={7}>
          Companies and information you authorized them to read from your vault.
        </Typography>
        {data && (
          <Box gap={4}>
            {data.map(sharing => (
              <SharingInfo
                key={sharing.orgName}
                name={sharing.orgName}
                logo={sharing.logoUrl}
                fields={sharing.canAccessData}
              />
            ))}
          </Box>
        )}
      </Container>
    );
  }

  return null;
};

export default Sharing;
