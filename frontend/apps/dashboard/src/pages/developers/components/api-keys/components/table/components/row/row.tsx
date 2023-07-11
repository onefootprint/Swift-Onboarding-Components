import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { ApiKey } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Badge, Box, Dropdown } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';
import usePermissions from 'src/hooks/use-permissions';

import EditRole from './components/edit-role';
import KeyCell from './components/key-cell';
import useReveal from './hooks/use-reveal-key';
import useUpdateStatus from './hooks/use-update-status';

export type RowProps = {
  apiKey: ApiKey;
};

const Row = ({ apiKey }: RowProps) => {
  const { t } = useTranslation('pages.developers.api-keys.table.manage');
  const reveal = useReveal(apiKey);
  const status = useUpdateStatus(apiKey);
  const isEnabled = apiKey.status === 'enabled';
  const { hasPermission } = usePermissions();

  return (
    <>
      <td>{apiKey.name}</td>
      <td>
        <KeyCell isLoading={reveal.mutation.isLoading} value={apiKey.key} />
      </td>
      <td>{apiKey.lastUsedAt || '--'}</td>
      <td>{apiKey.createdAt}</td>
      <td>
        <Badge variant={isEnabled ? 'success' : 'error'}>{apiKey.status}</Badge>
      </td>
      <td>
        {hasPermission(RoleScopeKind.orgSettings) ? (
          <EditRole apiKey={apiKey} />
        ) : (
          apiKey.role.name
        )}
      </td>
      <td>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown.Root>
            <PermissionGate
              scopeKind={RoleScopeKind.apiKeys}
              fallbackText={t('not-allowed')}
            >
              <Dropdown.Trigger aria-label={t('aria-label')}>
                <IcoDotsHorizontal24 />
              </Dropdown.Trigger>
            </PermissionGate>
            <Dropdown.Content align="end">
              <Dropdown.Item onSelect={reveal.toggle}>
                {apiKey.key ? t('reveal.hide') : t('reveal.show')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={status.toggle}>
                {isEnabled ? t('status.disable') : t('status.enable')}
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </Box>
      </td>
    </>
  );
};

export default Row;
