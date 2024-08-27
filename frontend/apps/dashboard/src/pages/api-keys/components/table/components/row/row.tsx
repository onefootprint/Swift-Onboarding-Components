import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { ApiKey } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Badge, Dropdown, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('api-keys', { keyPrefix: 'table' });
  const reveal = useReveal(apiKey);
  const status = useUpdateStatus(apiKey);
  const isEnabled = apiKey.status === 'enabled';
  const { hasPermission } = usePermissions();

  return (
    <>
      <td>{apiKey.name}</td>
      <td aria-label="cell">
        <KeyCell isLoading={reveal.mutation.isLoading} value={apiKey} />
      </td>
      <td>{apiKey.lastUsedAt || '--'}</td>
      <td>{apiKey.createdAt}</td>
      <td>
        <Badge variant={isEnabled ? 'success' : 'error'}>{t(`statuses.${apiKey.status}`)}</Badge>
      </td>
      <td>{hasPermission(RoleScopeKind.orgSettings) ? <EditRole apiKey={apiKey} /> : apiKey.role.name}</td>
      <td>
        <Stack justify="flex-end">
          <Dropdown.Root>
            <PermissionGate scopeKind={RoleScopeKind.apiKeys} fallbackText={t('manage.not-allowed')}>
              <Dropdown.Trigger aria-label={t('manage.aria-label')}>
                <IcoDotsHorizontal24 />
              </Dropdown.Trigger>
            </PermissionGate>
            <Dropdown.Content align="end">
              <Dropdown.Item onSelect={reveal.toggle}>
                {apiKey.key ? t('manage.reveal.hide') : t('manage.reveal.show')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={status.toggle}>
                {isEnabled ? t('manage.status.disable') : t('manage.status.enable')}
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </Stack>
      </td>
    </>
  );
};

export default Row;
