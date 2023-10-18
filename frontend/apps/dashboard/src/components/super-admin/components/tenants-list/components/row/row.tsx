import type { Tenant } from '@onefootprint/types';
import { Button, CodeInline, Stack, useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useAssumeTenant from 'src/hooks/use-assume-tenant';
import useRouter from 'src/hooks/use-router';

type TenantProps = {
  tenant: Tenant;
};

const Row = ({ tenant }: TenantProps) => {
  const { t } = useTranslation('super-admin');
  const router = useRouter();
  const useAssumeTenantMutation = useAssumeTenant();
  const toast = useToast();

  const waitAndCloseDialog = () => {
    setTimeout(() => {
      router.resetQuery();
    }, 200);
  };

  const handleAssume = () => {
    useAssumeTenantMutation.mutate(
      { tenantId: tenant.id },
      {
        onSuccess: async () => {
          toast.show({
            title: t('table.row.notification.title'),
            description: t('table.row.notification.description', {
              tenantName: tenant.name,
            }),
          });
          waitAndCloseDialog();
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
