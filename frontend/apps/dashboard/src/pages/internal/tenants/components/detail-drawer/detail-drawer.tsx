import { Drawer, LoadingSpinner, Stack, Text } from '@onefootprint/ui';

import useTenant from '../../hooks/use-tenant';
import Content from './components/content';

type DetailDrawerProps = {
  tenantId?: string;
  onClose: () => void;
};

const DetailDrawer = ({ tenantId, onClose }: DetailDrawerProps) => {
  const { data: tenant, isPending, isError } = useTenant({ id: tenantId });

  return (
    <Drawer open={!!tenantId} title={tenant?.name || 'Tenant details'} onClose={onClose}>
      {isPending && (
        <Stack justifyContent="center">
          <LoadingSpinner />
        </Stack>
      )}
      {isError && (
        <Text variant="body-3" color="error">
          Could not load tenant
        </Text>
      )}
      {tenant && <Content tenant={tenant} />}
    </Drawer>
  );
};

export default DetailDrawer;
