import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoTrash16 } from '@onefootprint/icons';
import { type Rule } from '@onefootprint/types';
import { Button, LinkButton, Stack, useToast } from '@onefootprint/ui';
import React from 'react';

import useDeleteRule from '../../hooks/use-delete-rule';
import useEditRule from '../../hooks/use-edit-rule';

export type RowEditButtonsProps = {
  playbookId: string;
  editedRule: Rule;
  onCancelClick: () => void;
  onSubmitClick: () => void;
};

const RowEditButtons = ({
  playbookId,
  editedRule,
  onCancelClick,
  onSubmitClick,
}: RowEditButtonsProps) => {
  const { t, allT } = useTranslation(
    'pages.playbooks.details.rules.action-row',
  );
  const editMutation = useEditRule();
  const deleteMutation = useDeleteRule();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const handleSaveEdit = () => {
    const fields = {
      rule_expression: editedRule.ruleExpression,
    };
    editMutation.mutate(
      { playbookId, ruleId: editedRule.ruleId, fields },
      {
        onSuccess: () => {
          onSubmitClick();
          toast.show({
            description: t('success-toast.edit-description'),
            title: t('success-toast.title'),
            variant: 'default',
          });
        },
        onError: (error: unknown) => {
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { playbookId, ruleId: editedRule.ruleId },
      {
        onSuccess: () => {
          onSubmitClick();
          toast.show({
            description: t('success-toast.delete-description'),
            title: t('success-toast.title'),
            variant: 'default',
          });
        },
        onError: (error: unknown) => {
          showRequestErrorToast(error);
        },
      },
    );
  };

  return (
    <Stack direction="column" gap={7} marginTop={5}>
      <Stack align="center" justify="space-between">
        <Stack align="center" gap={3}>
          <Button size="small" onClick={handleSaveEdit}>
            {allT('save')}
          </Button>
          <Button size="small" variant="secondary" onClick={onCancelClick}>
            {allT('cancel')}
          </Button>
        </Stack>
        <LinkButton
          size="tiny"
          variant="destructive"
          iconComponent={IcoTrash16}
          iconPosition="left"
          onClick={handleDelete}
        >
          {t('delete')}
        </LinkButton>
      </Stack>
    </Stack>
  );
};

export default RowEditButtons;
