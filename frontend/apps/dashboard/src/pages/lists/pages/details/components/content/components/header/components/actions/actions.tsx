import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Dropdown, useConfirmationDialog } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useDeleteList from './hooks/use-delete-list';

type ActionsProps = {
  disabled?: boolean; // injected by the PermissionsGate
};

const Actions = ({ disabled }: ActionsProps) => {
  const router = useRouter();
  const id = router.query.id as string;
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.header.actions',
  });
  const confirmationDialog = useConfirmationDialog();
  const deleteListMutation = useDeleteList(id);

  const deleteList = () => {
    deleteListMutation.mutate(undefined, {
      onSuccess: () => {
        confirmationDialog.hide();
        router.push('/lists');
      },
      onError: () => {
        confirmationDialog.hide();
      },
    });
  };

  const launchDeleteConfirmation = () => {
    confirmationDialog.open({
      description: t('delete-confirmation.description'),
      title: t('delete-confirmation.title'),
      secondaryButton: { label: t('delete-confirmation.cta.cancel') },
      primaryButton: {
        label: t('delete-confirmation.cta.delete'),
        onClick: deleteList,
      },
    });
  };

  return (
    <Dropdown.Root>
      <StyledTrigger $asButton aria-label={t('delete')} disabled={disabled}>
        <IcoDotsHorizontal24 />
      </StyledTrigger>
      <Dropdown.Content align="end" sideOffset={8}>
        <Dropdown.Item onSelect={launchDeleteConfirmation}>{t('delete')}</Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const StyledTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => {
    const { button } = theme.components;
    return css`
      cursor: pointer;
      transition: all 0.2s;

      &:not([disabled]) {
        box-shadow: ${button.variant.secondary.boxShadow};
      }

      &:not([disabled]):hover {
        background-color: ${button.variant.secondary.hover.bg};
      }
    `;
  }}
`;

export default Actions;
