import { primitives } from '@onefootprint/design-tokens';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoTrash16 } from '@onefootprint/icons';
import { type Rule } from '@onefootprint/types';
import { Button, LinkButton, Stack, Text, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useDeleteRule from './hooks/use-delete-rule';
import useEditRule from './hooks/use-edit-rule';

export type RowEditButtonsProps = {
  playbookId: string;
  editedRule: Rule;
  onCancel: () => void;
  onSubmit: () => void;
};

const RowEditButtons = ({
  playbookId,
  editedRule,
  onCancel,
  onSubmit,
}: RowEditButtonsProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules.action-row',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const editMutation = useEditRule();
  const deleteMutation = useDeleteRule();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const isLoading = editMutation.isLoading || deleteMutation.isLoading;

  const showDeleteConfirmation = () => {
    setIsDeleting(true);
  };

  const hideDeleteConfirmation = () => {
    setIsDeleting(false);
  };

  const handleEdit = () => {
    const { ruleExpression } = editedRule;
    const fields = {
      rule_expression: ruleExpression[ruleExpression.length - 1].field
        ? ruleExpression
        : ruleExpression.slice(0, -1),
    };
    editMutation.mutate(
      { playbookId, ruleId: editedRule.ruleId, fields },
      {
        onSuccess: () => {
          onSubmit();
          toast.show({
            description: t('success-toast.edit-description'),
            title: t('success-toast.title'),
            variant: 'default',
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { playbookId, ruleId: editedRule.ruleId },
      {
        onSuccess: () => {
          onSubmit();
          toast.show({
            description: t('success-toast.delete-description'),
            title: t('success-toast.title'),
            variant: 'default',
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  return isDeleting ? (
    <Stack direction="column" gap={5}>
      <Text variant="label-4">{t('delete-confirmation.title')}</Text>
      <DeleteConfirmation>
        <Button
          size="small"
          // variant="destructive"
          disabled={isLoading}
          onClick={handleDelete}
        >
          {t('delete-confirmation.confirm')}
        </Button>
        <Button
          size="small"
          variant="secondary"
          disabled={isLoading}
          onClick={hideDeleteConfirmation}
        >
          {allT('cancel')}
        </Button>
      </DeleteConfirmation>
    </Stack>
  ) : (
    <Stack align="center" justify="space-between">
      <Stack align="center" gap={3}>
        <Button size="small" disabled={isLoading} onClick={handleEdit}>
          {allT('save')}
        </Button>
        <Button
          size="small"
          variant="secondary"
          disabled={isLoading}
          onClick={onCancel}
        >
          {allT('cancel')}
        </Button>
      </Stack>
      <LinkButton
        size="tiny"
        variant="destructive"
        iconComponent={IcoTrash16}
        iconPosition="left"
        onClick={showDeleteConfirmation}
      >
        {t('delete')}
      </LinkButton>
    </Stack>
  );
};

export default RowEditButtons;

const DeleteConfirmation = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    gap: ${theme.spacing[3]};

    button:first-child {
      background-color: ${theme.color.error};

      &:hover:enabled {
        background-color: ${primitives.Red700};
      }
    }
  `};
`;
