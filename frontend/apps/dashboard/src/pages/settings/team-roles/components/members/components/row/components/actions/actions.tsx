import type { Member } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Box, Dialog, Dropdown, IconButton, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled from 'styled-components';

import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import useRemoveMember from './hooks/use-remove-org-member';

export type ActionsProps = {
  member: Member;
};

const Actions = ({ member }: ActionsProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.table.actions',
  });
  const { email, firstName, lastName, id } = member;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const removeMemberMutation = useRemoveMember(email);

  const showConfirmation = () => {
    setDropdownOpen(false);
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
    <Stack justify="flex-end" onClick={e => e.stopPropagation()}>
      <Dropdown.Root onOpenChange={setDropdownOpen} open={dropdownOpen}>
        <PermissionGate scopeKind={RoleScopeKind.orgSettings} fallbackText={t('not-allowed')}>
          <Dropdown.Trigger asChild>
            <IconButton aria-label={t('aria-label', { email })} size="tiny">
              <IcoDotsHorizontal24 testID="nav-dropdown-button" color="primary" />
            </IconButton>
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Content align="end">
          <Dropdown.Group>
            <Dropdown.Item onSelect={handleRemove} variant="destructive">
              {t('remove.cta')}
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Root>
      <Box>
        <Dialog
          size="compact"
          open={open}
          onClose={hideConfirmation}
          title={t('remove.confirmation.title')}
          primaryButton={{
            loading: removeMemberMutation.isPending,
            label: allT('confirm.cta'),
            onClick: remove,
          }}
          secondaryButton={{
            disabled: removeMemberMutation.isPending,
            label: allT('confirm.cancel'),
            onClick: hideConfirmation,
          }}
        >
          <Text variant="body-2" color="secondary" textAlign="center">
            <Trans
              ns="settings"
              i18nKey="pages.members.table.actions.remove.confirmation.description"
              components={{
                b: <Bold />,
              }}
              values={{
                name: firstName ? `${firstName} ${lastName} (${email})` : email,
              }}
            />
          </Text>
        </Dialog>
      </Box>
    </Stack>
  );
};

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Actions;
