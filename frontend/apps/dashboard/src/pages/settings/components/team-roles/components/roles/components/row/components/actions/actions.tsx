import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { OrgRole } from '@onefootprint/types';
import { Box, Dropdown } from '@onefootprint/ui';
import React, { useRef } from 'react';

import Edit, { EditHandler } from './components/edit';
import Remove, { RemoveHandler } from './components/remove';

export type ActionsProps = {
  role: OrgRole;
};

const Actions = ({ role }: ActionsProps) => {
  const { name } = role;
  const { t } = useTranslation('pages.settings.roles.table.actions');
  const removeRef = useRef<RemoveHandler>(null);
  const editRef = useRef<EditHandler>(null);

  const handleEdit = () => {
    editRef.current?.edit();
  };

  const handleRemove = () => {
    removeRef.current?.remove();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Dropdown.Root>
        <Dropdown.Trigger aria-label={t('aria-label', { name })}>
          <IcoDotsHorizontal24 />
        </Dropdown.Trigger>
        <Dropdown.Content align="end">
          <Dropdown.Item onSelect={handleEdit}>{t('edit')}</Dropdown.Item>
          <Dropdown.Item onSelect={handleRemove}>{t('remove')}</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Remove role={role} ref={removeRef} />
      <Edit role={role} ref={editRef} />
    </Box>
  );
};

export default Actions;
