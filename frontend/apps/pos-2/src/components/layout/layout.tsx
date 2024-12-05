import { IcoFootprintShield16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <Stack center height="100vh" width="100%" gap={6} flexDirection="column">
    <Stack borderWidth={1} borderColor="tertiary" borderStyle="solid" padding={8} width="500px">
      {children}
    </Stack>
    <Stack tag="footer" alignItems="center" gap={3}>
      <IcoFootprintShield16 />
      <Text variant="label-3">Powered by Footprint</Text>
    </Stack>
  </Stack>
);

export default Layout;
