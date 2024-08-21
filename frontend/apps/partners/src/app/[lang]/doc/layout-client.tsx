'use client';

import { Stack } from '@onefootprint/ui';
import type React from 'react';

const DocRootLayoutClient = ({ children }: React.PropsWithChildren) => (
  <Stack backgroundColor="secondary" flexFlow="column" height="100vh" width="100%">
    {children}
  </Stack>
);

export default DocRootLayoutClient;
