import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Box, createFontStyles, Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import ConfirmationDialog from './components/confirmation-dialog';
import useRemoveRole from './hooks/use-remove-role';

export type ActionsProps = {
  id: string;
  name: string;
};

const Actions = ({ id, name }: ActionsProps) => {
  const { t } = useTranslation('pages.settings.roles.table.actions');
  const [open, setOpen] = useState(false);
  const removeRoleMutation = useRemoveRole(name);

  const showConfirmation = () => {
    setOpen(true);
  };

  const hideConfirmation = () => {
    setOpen(false);
  };

  const handleRemove = () => {
    showConfirmation();
  };

  const remove = () => {
    removeRoleMutation.mutate(id, {
      onSuccess: hideConfirmation,
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Dropdown.Root>
        <Dropdown.Trigger aria-label={t('aria-label', { name })}>
          <IcoDotsHorizontal24 />
        </Dropdown.Trigger>
        <Dropdown.Content align="end">
          <Dropdown.Item onSelect={handleRemove}>
            {t('remove.cta')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <ConfirmationDialog
        isLoading={removeRoleMutation.isLoading}
        onClose={hideConfirmation}
        onConfirm={remove}
        open={open}
        title={t('remove.confirmation.title')}
      >
        <Trans
          i18nKey="pages.settings.roles.table.actions.remove.confirmation.description"
          components={{
            b: <Bold />,
          }}
          values={{ name }}
        />
      </ConfirmationDialog>
    </Box>
  );
};

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Actions;
