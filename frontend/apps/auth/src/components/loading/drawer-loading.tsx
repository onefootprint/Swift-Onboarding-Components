'use client';

import { FullHeightContainer } from '@onefootprint/idv';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Loading from '../identify/components/loading';

const DrawerLoading = (): JSX.Element => (
  <FullHeightContainer variant="drawer" hasBorderRadius>
    <Box paddingRight={7} paddingBottom={8} paddingLeft={7}>
      <Loading />
    </Box>
  </FullHeightContainer>
);

export default DrawerLoading;
