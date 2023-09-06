import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import type { Role } from '@onefootprint/types';
import { createFontStyles, useToast } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Trans } from 'react-i18next';

import ConfirmationDialog from './components/confirmation-dialog';
import useRemoveRole from './hooks/use-remove-role';

export type RemoveHandler = {
  remove: () => void;
};

export type RemoveProps = {
  role: Role;
};

const Remove = forwardRef<RemoveHandler, RemoveProps>(({ role }, ref) => {
  const { id, numActiveUsers, name, numActiveApiKeys } = role;
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
    if (numActiveUsers > 0) {
      toast.show({
        title: t('errors.num-active-users.title'),
        description: t('errors.num-active-users.description', {
          count: numActiveUsers,
        }),
        variant: 'error',
      });
    } else if (numActiveApiKeys > 0) {
      toast.show({
        title: t('errors.num-active-api-keys.title'),
        description: t('errors.num-active-api-keys.description', {
          count: numActiveApiKeys,
        }),
        variant: 'error',
      });
    } else {
      showConfirmation();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      remove: handleRemove,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
