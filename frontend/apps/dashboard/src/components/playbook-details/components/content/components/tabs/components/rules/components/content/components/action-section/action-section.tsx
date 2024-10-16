import type { Color } from '@onefootprint/design-tokens';
import { IcoFileText16 } from '@onefootprint/icons';
import type { EditedRule, Rule } from '@onefootprint/types';
import { RuleAction } from '@onefootprint/types';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import cloneDeep from 'lodash/cloneDeep';
import kebabCase from 'lodash/kebabCase';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RulesActionRow from 'src/components/rules-action-row';
import styled, { css } from 'styled-components';

import type { AddedRuleWithId } from '../..';
import EmptyActionRow from '../empty-action-row';

export type ActionSectionProps = {
  isEditing: boolean;
  action: RuleAction;
  rules: Rule[];
  onAdd: (rules: AddedRuleWithId[]) => void;
  onDelete: (id: string) => void;
  onEdit: (rule: EditedRule) => void;
  onUndoDelete: (id: string) => void;
  onUndoEdit: (id: string) => void;
  onDeleteAdd: (tempId: string) => void;
};

const ActionSection = ({
  isEditing,
  action,
  rules,
  onAdd,
  onDelete,
  onEdit,
  onUndoDelete,
  onUndoEdit,
  onDeleteAdd,
}: ActionSectionProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-section' });
  const [addedRules, setAddedRules] = useState<AddedRuleWithId[]>([]);

  useEffect(() => {
    setAddedRules([]);
  }, [rules, isEditing]);

  const isStepUpSubsection = [RuleAction.stepUpIdentity, RuleAction.stepUpPoA, RuleAction.stepUpIdentitySsn].includes(
    action,
  );
  const showStepUpTitle = action === RuleAction.stepUpIdentitySsn;
  const actionName = showStepUpTitle ? 'step-up' : kebabCase(action);
  const textColors: Record<string, Color> = {
    fail: 'error',
    'step-up': 'info',
    'manual-review': 'warning',
    'pass-with-manual-review': 'success',
  };
  const actionTitle = (
    <Stack direction="column" gap={1} textAlign="left" paddingBottom={showStepUpTitle ? 5 : 0}>
      <Text variant="label-2" color={textColors[actionName]}>
        {t(`${actionName}.title` as ParseKeys<'common'>)}
      </Text>
      <Text variant="body-2" color="secondary">
        {t(`${actionName}.subtitle` as ParseKeys<'common'>)}
      </Text>
    </Stack>
  );

  const handleAddEmptyRow = () => {
    setAddedRules(currentRules => {
      const newRules = cloneDeep(currentRules);
      newRules.push({
        tempId: `${action}_${currentRules.length}`,
        ruleAction: action,
        ruleExpression: [],
      });
      return newRules;
    });
  };

  const handleEditEmptyRow = (rule: AddedRuleWithId) => {
    setAddedRules(currentRules => {
      const newRules = cloneDeep(currentRules);
      const tempId = newRules.findIndex((r: AddedRuleWithId) => r.tempId === rule.tempId);
      newRules[tempId] = rule;
      onAdd(newRules);
      return newRules;
    });
  };

  const handleDeleteNewRow = (tempId: string) => {
    setAddedRules(currentRules => currentRules.filter(rule => rule.tempId !== tempId));
    onDeleteAdd(tempId);
  };

  const getRuleList = () => {
    const emptyRows = addedRules.map(rule => (
      <EmptyActionRow
        key={rule.tempId}
        tempId={rule.tempId}
        action={action}
        onEdit={handleEditEmptyRow}
        onDelete={handleDeleteNewRow}
      />
    ));
    if (rules.length) {
      return (
        <>
          {rules.map(rule => (
            <RulesActionRow
              key={JSON.stringify(rule)}
              isEditing={isEditing}
              rule={rule}
              onDelete={onDelete}
              onEdit={onEdit}
              onUndoDelete={onUndoDelete}
              onUndoEdit={onUndoEdit}
            />
          ))}
          {addedRules.length > 0 && emptyRows}
        </>
      );
    }
    return (
      <EmptySection>
        {addedRules.length > 0 ? (
          emptyRows
        ) : (
          <Text variant="body-3" paddingTop={3} paddingBottom={3} paddingLeft={4} paddingRight={4}>
            {t('empty-rules')}
          </Text>
        )}
      </EmptySection>
    );
  };

  return (
    <Stack
      direction="column"
      gap={1}
      role="group"
      aria-label={t(`${kebabCase(actionName)}.title` as ParseKeys<'common'>)}
    >
      {showStepUpTitle && actionTitle}
      <Stack align="start" justify="space-between">
        {isStepUpSubsection ? (
          <Stack align="center" gap={3}>
            <IcoFileText16 />
            <Text variant="label-3">{t(`step-up.${kebabCase(action)}` as ParseKeys<'common'>)}</Text>
          </Stack>
        ) : (
          actionTitle
        )}
        {isEditing && <LinkButton onClick={handleAddEmptyRow}>{t('add-rule')}</LinkButton>}
      </Stack>
      <RuleList data-is-empty={!rules.length}>{getRuleList()}</RuleList>
    </Stack>
  );
};

const RuleList = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[4]} 0;

    &[data-is-empty='false'] {
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      border-radius: ${theme.borderRadius.default};
      background-color: ${theme.backgroundColor.primary};
    }
  `}
`;

const EmptySection = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
  `}
`;

export default ActionSection;
