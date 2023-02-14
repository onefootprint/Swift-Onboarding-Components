import { useTranslation } from '@onefootprint/hooks';
import { Role } from '@onefootprint/types';
import { createFontStyles, useToast } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import ConfirmationDialog from './components/confirmation-dialog';
import useRemoveRole from './hooks/use-remove-role';

export type RemoveHandler = {
  remove: () => void;
};

export type RemoveProps = {
  role: Role;
};

const Remove = forwardRef<RemoveHandler, RemoveProps>(({ role }, ref) => {
  const { id, numActiveUsers, name } = role;
  const { t } = useTranslation('pages.settings.roles.remove');
  const [open, setOpen] = useState(false);
  const removeRoleMutation = useRemoveRole(name);
  const toast = useToast();

  const showConfirmation = () => {
    setOpen(true);
  };

  const hideConfirmation = () => {
    setOpen(false);
  };

  const remove = () => {
    removeRoleMutation.mutate(id, {
      onSuccess: hideConfirmation,
    });
  };

  const handleRemove = () => {
    if (numActiveUsers === 0) {
      showConfirmation();
    } else {
      toast.show({
        title: t('errors.num-active-users.title'),
        description: t('errors.num-active-users.description', {
          count: numActiveUsers,
        }),
        variant: 'error',
      });
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      remove: handleRemove,
    }),
    [],
  );

  return (
    <ConfirmationDialog
      isLoading={removeRoleMutation.isLoading}
      onClose={hideConfirmation}
      onConfirm={remove}
      open={open}
      title={t('confirmation.title')}
    >
      <Trans
        i18nKey="pages.settings.roles.remove.confirmation.description"
        components={{
          b: <Bold />,
        }}
        values={{ name }}
      />
    </ConfirmationDialog>
  );
});

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Remove;
