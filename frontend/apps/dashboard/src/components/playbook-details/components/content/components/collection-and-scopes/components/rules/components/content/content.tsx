import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import type {
  EditedRule,
  ListRuleField,
  OnboardingConfig,
  RiskSignalRuleField,
  Rule,
} from '@onefootprint/types';
import { OnboardingConfigKind, RuleAction } from '@onefootprint/types';
import {
  Button,
  InlineAlert,
  Stack,
  Text,
  Tooltip,
  useToast,
} from '@onefootprint/ui';
import { cloneDeep, flatten, isEqual } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { createGlobalStyle, css } from 'styled-components';

import ActionSection from './components/action-section';
import BacktestingDialog from './components/backtesting-dialog';
import useEditRules from './hooks/use-edit-rules';

export type ContentProps = {
  hasRules: boolean;
  playbook: OnboardingConfig;
  shouldAllowEditing: boolean;
  actionRules: Record<string, Rule[]>;
  toggleDisableHeading: (disable: boolean) => void;
};

export type AddedRuleWithId = {
  tempId: string;
  ruleAction: RuleAction;
  ruleExpression: (RiskSignalRuleField | ListRuleField)[];
};

const Content = ({
  hasRules,
  playbook,
  shouldAllowEditing,
  actionRules,
  toggleDisableHeading,
}: ContentProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules',
  });
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addedRules, setAddedRules] = useState<AddedRuleWithId[]>([]);
  const [deletedRuleIds, setDeletedRuleIds] = useState<string[]>([]);
  const [editedRules, setEditedRules] = useState<EditedRule[]>([]);
  const editMutation = useEditRules();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const getLayoutElement = () => document.getElementById('page-main');

  const handleStartEdit = () => {
    setIsEditing(true);

    // Make background color gray and disable heading section of Playbook details
    const layoutElement = getLayoutElement();
    layoutElement?.classList.add('editing');
    toggleDisableHeading(true);
  };

  const handleAddRule = (newRules: AddedRuleWithId[]) => {
    setAddedRules(currentRules => {
      const unchangedAddedRules = currentRules.filter(currRule =>
        newRules.every(newRule => newRule.tempId !== currRule.tempId),
      );
      return unchangedAddedRules.concat(newRules);
    });
  };

  const handleDeleteAddedRule = (tempId: string) => {
    setAddedRules(currentRules =>
      currentRules.filter(rule => rule.tempId !== tempId),
    );
  };

  const handleDeleteRule = (id: string) => {
    setDeletedRuleIds(currentIds => [...currentIds, id]);
    if (editedRules.map(({ ruleId }) => ruleId).includes(id)) {
      setEditedRules(currentRules =>
        currentRules.filter(({ ruleId }) => ruleId !== id),
      );
    }
  };

  const handleUndoDeleteRule = (id: string) => {
    setDeletedRuleIds(currentIds =>
      currentIds.filter(currentId => currentId !== id),
    );
  };

  const handleEditRule = (rule: EditedRule) => {
    setEditedRules(currentRules => {
      // If the rule is the same as it was originally, don't log it in editedRules
      const oldRule = flatten(Object.values(actionRules)).find(
        r => r.ruleId === rule.ruleId,
      );
      const index = currentRules.findIndex(
        (r: EditedRule) => r.ruleId === rule.ruleId,
      );
      if (isEqual(rule.ruleExpression, oldRule?.ruleExpression)) {
        return index === -1
          ? currentRules
          : currentRules.filter((_, i) => i !== index);
      }

      const newRules = cloneDeep(currentRules);
      if (index === -1) {
        newRules.push(rule);
      } else {
        newRules[index] = rule;
      }
      return newRules;
    });
  };

  const handleUndoEditRule = (id: string) => {
    setEditedRules(currentRules =>
      currentRules.filter(rule => rule.ruleId !== id),
    );
  };

  const resetEdits = () => {
    setAddedRules([]);
    setDeletedRuleIds([]);
    setEditedRules([]);
    setIsEditing(false);

    // Remove gray and disabled background
    const layoutElement = getLayoutElement();
    layoutElement?.classList.remove('editing');
    toggleDisableHeading(false);
  };

  const formatRuleFields = () => {
    const add = addedRules
      .filter(rule => rule.ruleExpression.some(ruleField => ruleField.field))
      .map((rule: AddedRuleWithId) => {
        const newRule = cloneDeep(rule);
        delete newRule['tempId' as keyof AddedRuleWithId];
        return newRule;
      });
    return {
      add,
      delete: deletedRuleIds,
      edit: editedRules.filter(rule =>
        rule.ruleExpression.some(ruleField => ruleField.field),
      ),
    };
  };

  const handleSave = () => {
    const fields = {
      ...formatRuleFields(),
      expectedRuleSetVersion: playbook.ruleSet.version,
    };
    editMutation.mutate(
      { playbookId: playbook.id, fields },
      {
        onSuccess: () => {
          resetEdits();
          setOpen(false);
          toast.show({
            title: t('success-toast.title'),
            description: t('success-toast.description'),
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  return (
    <>
      <GlobalStyle />
      <Stack direction="column" gap={7}>
        <Stack justify="space-between" align="center">
          <Stack direction="column" gap={1}>
            <Text variant="label-3">{t('title')}</Text>
            <Text variant="body-3" color="secondary">
              {t('description')}
            </Text>
          </Stack>
          {shouldAllowEditing && !isEditing && (
            <Button
              variant="secondary"
              disabled={editMutation.isLoading}
              onClick={handleStartEdit}
            >
              {allT('edit')}
            </Button>
          )}
        </Stack>
        {playbook.kind === OnboardingConfigKind.kyb && hasRules && (
          <InlineAlert variant="info">{t('alerts.kyb-alert')}</InlineAlert>
        )}
        {hasRules ? (
          Object.values(RuleAction).map(action => (
            <ActionSection
              key={action}
              isEditing={isEditing}
              action={action}
              rules={actionRules[action]}
              onAdd={handleAddRule}
              onDelete={handleDeleteRule}
              onEdit={handleEditRule}
              onUndoDelete={handleUndoDeleteRule}
              onUndoEdit={handleUndoEditRule}
              onDeleteAdd={handleDeleteAddedRule}
            />
          ))
        ) : (
          <Text variant="body-3">{t('empty-rules')}</Text>
        )}
        {isEditing && (
          <EditBar>
            <Stack justify="space-between" align="center">
              <Stack gap={2} align="center">
                <Text variant="label-3">{t('edit-bar.editing-rules')}</Text>
                <Tooltip text={t('edit-bar.tooltip')}>
                  <IcoInfo16 />
                </Tooltip>
              </Stack>
              <Stack gap={4} align="center">
                <Button variant="secondary" onClick={resetEdits}>
                  {allT('cancel')}
                </Button>
                <Button
                  disabled={[addedRules, deletedRuleIds, editedRules].every(
                    arr => arr.length === 0,
                  )}
                  onClick={() => setOpen(true)}
                >
                  {t('edit-bar.test-changes')}
                </Button>
              </Stack>
            </Stack>
          </EditBar>
        )}
      </Stack>
      {open && (
        <BacktestingDialog
          open={open}
          playbookId={playbook.id}
          ruleEdits={formatRuleFields()}
          isSaveLoading={editMutation.isLoading}
          onSave={handleSave}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    #page-main.editing {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const EditBar = styled.div`
  ${({ theme }) => css`
    position: sticky;
    left: 50%;
    bottom: 0;
    bottom: ${theme.spacing[7]};
    transform: translateX(-50%);
    width: 510px;
    padding: ${theme.spacing[4]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[1]};
  `}
`;

export default Content;
