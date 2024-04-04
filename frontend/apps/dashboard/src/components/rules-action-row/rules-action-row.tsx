import {
  IcoClockSmall16,
  IcoPlusSmall16,
  IcoReturn16,
  IcoTrash16,
} from '@onefootprint/icons';
import type { EditedRule, Rule, RuleField } from '@onefootprint/types';
import { RuleOp } from '@onefootprint/types';
import {
  Badge,
  createFontStyles,
  IconButton,
  LinkButton,
  Stack,
  Text,
  useToast,
} from '@onefootprint/ui';
import { isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import OpBadge from './components/op-badge';
import RiskSignalSelect from './components/risk-signal-select';

export type RulesActionRowProps = {
  isEditing: boolean;
  rule: Rule;
  onDelete?: (id: string) => void;
  onEdit?: (rule: EditedRule) => void;
  onUndoDelete?: (id: string) => void;
  onUndoEdit?: (id: string) => void;
};

const RulesActionRow = ({
  isEditing,
  rule,
  onDelete,
  onEdit,
  onUndoDelete,
  onUndoEdit,
}: RulesActionRowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules.action-row',
  });
  const [isPendingChange, setIsPendingChange] = useState(false);
  const [isPendingDeletion, setIsPendingDeletion] = useState(false);
  const [expressions, setExpressions] = useState<RuleField[]>(
    rule.ruleExpression,
  );
  const toast = useToast();

  useEffect(() => {
    setExpressions(rule.ruleExpression);
    setIsPendingChange(false);
    setIsPendingDeletion(false);
  }, [rule, isEditing]);

  const handleEditRule = (newExpression: RuleField[]) => {
    onEdit?.({
      ruleId: rule.ruleId,
      ruleExpression: newExpression[newExpression.length - 1].field // Remove empty trailing fields
        ? newExpression
        : newExpression.slice(0, -1),
    });
    setIsPendingChange(!isEqual(newExpression, rule.ruleExpression));
  };

  // Using index instead of expression in case the rule has the same expression multiple times
  const handleToggleOp = (index: number) => (newOp: RuleOp) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], op: newOp };
      handleEditRule(newExpressions);
      return newExpressions;
    });
  };

  const handleChangeField = (index: number) => (newField: string) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], field: newField };
      handleEditRule(newExpressions);
      return newExpressions;
    });
  };

  const handleDeleteField = (index: number) => {
    setExpressions(currentExpressions => {
      const newExpressions = currentExpressions
        .slice(0, index)
        .concat(currentExpressions.slice(index + 1));
      handleEditRule(newExpressions);
      return newExpressions;
    });
  };

  const handleAddField = () => {
    setExpressions(currentExpressions => {
      const newExpressions = [
        ...currentExpressions,
        { field: '', op: RuleOp.eq, value: true },
      ];
      handleEditRule(newExpressions);
      return newExpressions;
    });
  };

  const handleUndo = () => {
    setExpressions(rule.ruleExpression);
    setIsPendingChange(false);
    setIsPendingDeletion(false);
    onUndoEdit?.(rule.ruleId);
    onUndoDelete?.(rule.ruleId);
  };

  const handleDeleteRule = () => {
    onDelete?.(rule.ruleId);
    setIsPendingDeletion(true);
    toast.show({
      title: t('delete-toast.title'),
      description: t('delete-toast.description'),
      cta: {
        label: t('delete-toast.undo'),
        onClick: handleUndo,
      },
    });
  };

  return (
    <RulesListItem role="row" aria-label={rule.ruleExpression[0].field}>
      <Stack justify="space-between" align="start">
        <div>
          {t('if')}
          {expressions.map((expression, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={`${index} ${expression.field}`}>
              {index > 0 && <AndContainer>{t('and')}</AndContainer>}
              <OpBadge
                defaultValue={expression.op}
                isEditable={isEditing}
                onClick={handleToggleOp(index)}
              />
              {isEditing ? (
                <RiskSignalSelect
                  value={expression.field}
                  onDelete={
                    expressions.length > 1
                      ? () => handleDeleteField(index)
                      : undefined
                  }
                  onChange={handleChangeField(index)}
                />
              ) : (
                <Badge variant="info">{expression.field}</Badge>
              )}
            </React.Fragment>
          ))}
        </div>
        <Stack align="center">
          {isEditing && (isPendingChange || isPendingDeletion) && (
            <div>
              <IconButton aria-label="undo" onClick={handleUndo}>
                <IcoReturn16 />
              </IconButton>
            </div>
          )}
          {isEditing && !isPendingDeletion && (
            <div>
              <IconButton aria-label="delete" onClick={handleDeleteRule}>
                <IcoTrash16 color="error" />
              </IconButton>
            </div>
          )}
        </Stack>
      </Stack>
      {isEditing && !isPendingDeletion && (
        <Stack gap={7} direction="column" width="100%">
          <LinkButton
            iconComponent={IcoPlusSmall16}
            iconPosition="left"
            disabled={expressions.some(expression => expression.field === '')}
            onClick={handleAddField}
          >
            {t('add')}
          </LinkButton>
        </Stack>
      )}
      {(isPendingChange || isPendingDeletion) && (
        <Stack align="center" gap={2}>
          <IcoClockSmall16 color={isPendingChange ? 'tertiary' : 'error'} />
          <Text
            variant="caption-1"
            color={isPendingChange ? 'tertiary' : 'error'}
          >
            {isPendingChange ? t('pending-change') : t('pending-deletion')}
          </Text>
        </Stack>
      )}
    </RulesListItem>
  );
};

const RulesListItem = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[4]}
      ${theme.spacing[4]};
    ${createFontStyles('body-4')}
    line-height: 240%;

    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

const AndContainer = styled.span`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[2]};
  `}
`;

export default RulesActionRow;
