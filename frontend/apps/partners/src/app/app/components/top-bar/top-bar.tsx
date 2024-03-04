import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

import { DEFAULT_PUBLIC_ROUTE } from '@/config/constants';

const TopBar = () => (
  <Box
    backgroundColor="primary"
    paddingInline={7}
    maxHeight="48px"
    width="100%"
    borderBottomWidth={1}
    borderColor="primary"
    borderStyle="solid"
  >
    <Link href={DEFAULT_PUBLIC_ROUTE} aria-label="Home">
      <Box
        tag="i"
        position="relative"
        display="flex"
        alignItems="center"
        paddingTop={4}
        paddingBottom={4}
      >
        <ThemedLogoFpCompact color="primary" />
      </Box>
    </Link>
  </Box>
);

export default TopBar;
