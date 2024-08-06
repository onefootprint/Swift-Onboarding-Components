'use client';

import { FullHeightContainer } from '@onefootprint/idv';
import Loading from '@onefootprint/idv/src/components/identify/components/loading';
import { Box } from '@onefootprint/ui';

const DrawerLoading = (): JSX.Element => (
  <FullHeightContainer variant="drawer" hasBorderRadius>
    <Box paddingRight={7} paddingBottom={8} paddingLeft={7}>
      <Loading />
    </Box>
  </FullHeightContainer>
);

export default DrawerLoading;
