import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { Role } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Box, IconButton } from '@onefootprint/ui';
import { Dropdown, Stack } from '@onefootprint/ui';
import { useRef, useState } from 'react';
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
    keyPrefix: 'pages.roles.table.actions',
  });
  const [openDropdown, setOpenDropdown] = useState(false);
  const removeRef = useRef<RemoveHandler>(null);
  const editRef = useRef<EditHandler>(null);

  const handleEdit = (event: Event) => {
    event.preventDefault();
    editRef.current?.edit();
    setOpenDropdown(false);
  };

  const handleRemove = (event: Event) => {
    event.preventDefault();
    removeRef.current?.remove();
    setOpenDropdown(false);
  };

  return (
    <Stack justify="flex-end" onClick={e => e.stopPropagation()}>
      <Dropdown.Root open={openDropdown} onOpenChange={setOpenDropdown}>
        <PermissionGate scopeKind={RoleScopeKind.orgSettings} fallbackText={t('not-allowed')}>
          <Dropdown.Trigger asChild>
            <Box>
              <IconButton aria-label={t('aria-label', { name })} size="tiny">
                <IcoDotsHorizontal24 />
              </IconButton>
            </Box>
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Portal>
          <Dropdown.Content align="end">
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleEdit}>{t('edit')}</Dropdown.Item>
              <Dropdown.Item onSelect={handleRemove} variant="destructive">
                {t('remove')}
              </Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <Remove role={role} ref={removeRef} />
      <Edit role={role} ref={editRef} />
    </Stack>
  );
};

export default Actions;
