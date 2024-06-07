'use client';

import { Stack } from '@onefootprint/ui';
import React from 'react';

const AuthLayoutClient = ({ children }: React.PropsWithChildren) => (
  <Stack backgroundColor="secondary" width="100%" height="100vh" alignItems="center" justifyContent="center">
    {children}
  </Stack>
);

export default AuthLayoutClient;
