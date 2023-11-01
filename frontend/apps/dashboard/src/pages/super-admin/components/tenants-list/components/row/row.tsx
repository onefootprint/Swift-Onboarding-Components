import type { Tenant } from '@onefootprint/types';
import { Button, CodeInline, Stack } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PUBLIC_ROUTE } from 'src/config/constants';
import useAssumeTenant from 'src/hooks/use-assume-tenant';
import useSession from 'src/hooks/use-session';

type TenantProps = {
  tenant: Tenant;
};

const Row = ({ tenant }: TenantProps) => {
  const { t } = useTranslation('super-admin');
  const router = useRouter();
  const useAssumeTenantMutation = useAssumeTenant();
  const { refreshUserPermissions } = useSession();

  const handleAssume = () => {
    useAssumeTenantMutation.mutate(
      { tenantId: tenant.id },
      {
        onSuccess: async () => {
          await refreshUserPermissions();
          router.push(DEFAULT_PUBLIC_ROUTE);
        },
      },
    );
  };

  return (
    <>
      <td>{tenant.name}</td>
      <td>
        <CodeInline isPrivate truncate>
          {tenant.id}
        </CodeInline>
      </td>
      <td>{tenant.numLiveVaults}</td>
      <td>{tenant.numSandboxVaults}</td>
      <td>{tenant.createdAt}</td>
      <td>
        <Stack justify="flex-end">
          <Button
            size="small"
            onClick={handleAssume}
            loading={useAssumeTenantMutation.isLoading}
          >
            {t('table.row.assume')}
          </Button>
        </Stack>
      </td>
    </>
  );
};

export default Row;
