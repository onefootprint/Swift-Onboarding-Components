import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { OrgMember } from '@onefootprint/types';
import {
  Badge,
  Box,
  createFontStyles,
  Dialog,
  Dropdown,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import useRemoveOrgMember from './hooks/use-remove-org-member';

export type RowProps = OrgMember;

// TODO: https://linear.app/footprint/issue/FP-1877/add-dropdown-to-member-row-to-change-role-only-if-logged-in-user-is
const Row = ({
  id,
  firstName,
  lastName,
  email,
  lastLoginAt,
  roleName,
}: RowProps) => {
  const { t, allT } = useTranslation('pages.settings.members.table');
  const [open, setOpen] = useState(false);
  const removeOrgMemberMutation = useRemoveOrgMember(email);

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
    removeOrgMemberMutation.mutate(id, {
      onSuccess: () => {
        hideConfirmation();
      },
    });
  };

  return (
    <>
      <Td>
        {firstName ? (
          <Typography variant="body-3">
            {firstName} {lastName}
          </Typography>
        ) : (
          <Typography variant="body-3">-</Typography>
        )}
        <Typography variant="body-3" color="tertiary">
          {email}
        </Typography>
      </Td>
      <Td>
        <Typography variant="body-3">{lastLoginAt ?? '-'}</Typography>
      </Td>
      <Td>
        <Typography variant="body-3">{roleName}</Typography>
      </Td>
      <Td>
        {!lastLoginAt && <Badge variant="warning">{t('pending-invite')}</Badge>}
      </Td>
      <Td>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown.Root>
            <Dropdown.Trigger aria-label={t('actions.aria-label', { email })}>
              <IcoDotsHorizontal24 />
            </Dropdown.Trigger>
            <Dropdown.Content align="end">
              <Dropdown.Item onSelect={handleRemove}>
                {t('actions.remove.cta')}
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
          <Box>
            <Dialog
              size="compact"
              open={open}
              onClose={hideConfirmation}
              title={t('actions.remove.confirmation.title')}
              primaryButton={{
                loading: removeOrgMemberMutation.isLoading,
                label: allT('confirm.cta'),
                onClick: remove,
              }}
              secondaryButton={{
                disabled: removeOrgMemberMutation.isLoading,
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
                    name: firstName
                      ? `${firstName} ${lastName} (${email})`
                      : email,
                  }}
                />
              </Typography>
            </Dialog>
          </Box>
        </Box>
      </Td>
    </>
  );
};

const Td = styled.td`
  && {
    height: 56px;
  }
`;

const Bold = styled.b`
  ${createFontStyles('label-2')};
`;

export default Row;
