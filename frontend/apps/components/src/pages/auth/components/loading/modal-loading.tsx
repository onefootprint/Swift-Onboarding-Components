import { FullHeightContainer } from '@onefootprint/idv-elements';
import { Box } from '@onefootprint/ui';
import React from 'react';

import BaseLoading from './base-loading';

const ModalLoading = (): JSX.Element => (
  <FullHeightContainer variant="modal" hasBorderRadius>
    <Box paddingRight={7} paddingBottom={8} paddingLeft={7}>
      <BaseLoading />
    </Box>
  </FullHeightContainer>
);

export default ModalLoading;
