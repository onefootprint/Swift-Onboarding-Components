import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoTrash16 } from '@onefootprint/icons';
import { type Rule } from '@onefootprint/types';
import { Button, LinkButton, Stack, useToast } from '@onefootprint/ui';
import React from 'react';

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
  const { t, allT } = useTranslation(
    'pages.playbooks.details.rules.action-row',
  );
  const editMutation = useEditRule();
  const deleteMutation = useDeleteRule();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const isLoading = editMutation.isLoading || deleteMutation.isLoading;

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

  return (
    <Stack direction="column" gap={7}>
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
          disabled={isLoading}
          onClick={handleDelete}
        >
          {t('delete')}
        </LinkButton>
      </Stack>
    </Stack>
  );
};

export default RowEditButtons;
