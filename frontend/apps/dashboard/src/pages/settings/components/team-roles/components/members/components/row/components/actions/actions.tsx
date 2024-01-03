import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import type { Member } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import {
  Box,
  createFontStyles,
  Dialog,
  Dropdown,
  Stack,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import OverflowButton from 'src/components/overflow-button';
import PermissionGate from 'src/components/permission-gate';

import useRemoveMember from './hooks/use-remove-org-member';

export type ActionsProps = {
  member: Member;
};

const Actions = ({ member }: ActionsProps) => {
  const { t, allT } = useTranslation('pages.settings.members.table.actions');
  const { email, firstName, lastName, id } = member;
  const [open, setOpen] = useState(false);
  const removeMemberMutation = useRemoveMember(email);

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
    removeMemberMutation.mutate(id, {
      onSuccess: () => {
        hideConfirmation();
      },
    });
  };

  return (
    <Stack justify="flex-end">
      <Dropdown.Root>
        <PermissionGate
          scopeKind={RoleScopeKind.orgSettings}
          fallbackText={t('not-allowed')}
        >
          <OverflowButton ariaLabel={t('aria-label', { email })} />
        </PermissionGate>
        <Dropdown.Content align="end">
          <Dropdown.Item onSelect={handleRemove} variant="destructive">
            {t('remove.cta')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Box>
        <Dialog
          size="compact"
          open={open}
          onClose={hideConfirmation}
          title={t('remove.confirmation.title')}
          primaryButton={{
            loading: removeMemberMutation.isLoading,
            label: allT('confirm.cta'),
            onClick: remove,
          }}
          secondaryButton={{
            disabled: removeMemberMutation.isLoading,
            label: allT('confirm.cancel'),
            onClick: hideConfirmation,
          }}
        >
          <Typography
            variant="body-2"
            color="secondary"
            sx={{ textAlign: 'center' }}
          >
            <Trans
              i18nKey="pages.settings.members.table.actions.remove.confirmation.description"
              components={{
                b: <Bold />,
              }}
              values={{
                name: firstName ? `${firstName} ${lastName} (${email})` : email,
              }}
            />
          </Typography>
        </Dialog>
      </Box>
    </Stack>
  );
};

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Actions;
