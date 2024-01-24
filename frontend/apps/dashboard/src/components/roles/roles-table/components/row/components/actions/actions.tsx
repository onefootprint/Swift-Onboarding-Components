import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { Role } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Dropdown, Stack } from '@onefootprint/ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import type { EditHandler } from './components/edit';
import Edit from './components/edit';
import type { RemoveHandler } from './components/remove';
import Remove from './components/remove';

export type ActionsProps = {
  role: Role;
};

const Actions = ({ role }: ActionsProps) => {
  const { name } = role;
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.roles.table.actions',
  });
  const removeRef = useRef<RemoveHandler>(null);
  const editRef = useRef<EditHandler>(null);

  const handleEdit = () => {
    editRef.current?.edit();
  };

  const handleRemove = () => {
    removeRef.current?.remove();
  };

  return (
    <Stack justify="flex-end">
      <Dropdown.Root>
        <PermissionGate
          scopeKind={RoleScopeKind.orgSettings}
          fallbackText={t('not-allowed')}
        >
          <Dropdown.Trigger aria-label={t('aria-label', { name })}>
            <IcoDotsHorizontal24 />
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Content align="end">
          <Dropdown.Item onSelect={handleEdit}>{t('edit')}</Dropdown.Item>
          <Dropdown.Item onSelect={handleRemove} variant="destructive">
            {t('remove')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Remove role={role} ref={removeRef} />
      <Edit role={role} ref={editRef} />
    </Stack>
  );
};

export default Actions;
