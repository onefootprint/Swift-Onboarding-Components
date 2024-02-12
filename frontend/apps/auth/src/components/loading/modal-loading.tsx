'use client';

import { FullHeightContainer } from '@onefootprint/idv';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Loading from '../identify/components/loading';

const ModalLoading = (): JSX.Element => (
  <FullHeightContainer variant="modal" hasBorderRadius>
    <Box paddingRight={7} paddingBottom={8} paddingLeft={7}>
      <Loading />
    </Box>
  </FullHeightContainer>
);

export default ModalLoading;
