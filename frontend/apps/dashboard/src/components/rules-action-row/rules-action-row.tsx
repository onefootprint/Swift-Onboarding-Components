import {
  IcoBroadcast16,
  IcoClockSmall16,
  IcoDotsHorizontal16,
  IcoReturn16,
  IcoShuffle16,
  IcoTrash16,
} from '@onefootprint/icons';
import {
  type EditedRule,
  type ListRuleField,
  ListRuleOp,
  type RiskSignalRuleField,
  RiskSignalRuleOp,
  type Rule,
} from '@onefootprint/types';
import { Button, IconButton, Stack, Text, Tooltip, createFontStyles, useToast } from '@onefootprint/ui';
import { isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useLists from 'src/hooks/use-lists';

import { ListRuleChip, RiskSignalRuleChip } from './components/rule-chip';

export type RulesActionRowProps = {
  isEditing: boolean;
  rule: Rule;
  onDelete?: (id: string) => void;
  onEdit?: (rule: EditedRule) => void;
  onUndoDelete?: (id: string) => void;
  onUndoEdit?: (id: string) => void;
};

const RulesActionRow = ({ isEditing, rule, onDelete, onEdit, onUndoDelete, onUndoEdit }: RulesActionRowProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'details.rules.action-row',
  });
  const { data: lists } = useLists();
  const [isPendingChange, setIsPendingChange] = useState(false);
  const [isPendingDeletion, setIsPendingDeletion] = useState(false);
  const [expressions, setExpressions] = useState<(RiskSignalRuleField | ListRuleField)[]>(rule.ruleExpression);
  const toast = useToast();

  useEffect(() => {
    setExpressions(rule.ruleExpression);
    setIsPendingChange(false);
    setIsPendingDeletion(false);
  }, [rule, isEditing]);

  const handleEditRule = (newExpression: (RiskSignalRuleField | ListRuleField)[]) => {
    onEdit?.({
      ruleId: rule.ruleId,
      ruleExpression:
        newExpression.length && !newExpression[newExpression.length - 1].field // Remove empty trailing fields
          ? newExpression.slice(0, -1)
          : newExpression,
    });
    setIsPendingChange(!isEqual(newExpression, rule.ruleExpression));
  };

  // Using index instead of expression in case the rule has the same expression multiple times
  const handleChangeExpression = (index: number) => (newExpression: RiskSignalRuleField | ListRuleField) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = newExpression;
      handleEditRule(newExpressions);
      return newExpressions;
    });
  };

  const handleDeleteExpression = (index: number) => {
    setExpressions(currentExpressions => {
      const newExpressions = currentExpressions.slice(0, index).concat(currentExpressions.slice(index + 1));
      handleEditRule(newExpressions);
      return newExpressions;
    });
  };

  const handleAddRiskSignalExpression = () => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions, { field: '', op: RiskSignalRuleOp.eq, value: true }];
      setIsPendingChange(true);
      return newExpressions;
    });
  };

  const handleAddListExpression = () => {
    setExpressions(currentExpressions => {
      const newExpressions = [
        ...currentExpressions,
        {
          field: undefined,
          op: ListRuleOp.isIn,
          value: '',
        },
      ];
      setIsPendingChange(true);
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
    <RulesListItem role="row" aria-label={rule.ruleExpression.map(({ field }) => field).join(', ')}>
      <Stack justify="space-between" align="start">
        <Stack align="center" gap={3} flexWrap="wrap">
          <Text variant="body-4">{t('if')}</Text>
          {expressions.length ? (
            expressions.map((expression, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={`${index} ${expression.field}`}>
                {index > 0 && (
                  <Text variant="body-4" paddingLeft={2} paddingRight={2}>
                    {t('and')}
                  </Text>
                )}
                {expression.op === ListRuleOp.isIn || expression.op === ListRuleOp.isNotIn ? (
                  <ListRuleChip
                    isEditing={isPendingDeletion ? false : isEditing}
                    defaultExpression={expression}
                    lists={lists?.data}
                    onDelete={() => handleDeleteExpression(index)}
                    onChange={handleChangeExpression(index)}
                  />
                ) : (
                  <RiskSignalRuleChip
                    isEditing={isPendingDeletion ? false : isEditing}
                    defaultExpression={expression as RiskSignalRuleField}
                    onDelete={() => handleDeleteExpression(index)}
                    onChange={handleChangeExpression(index)}
                  />
                )}
              </React.Fragment>
            ))
          ) : (
            <EmptyExpression>
              <IcoDotsHorizontal16 color="quaternary" />
            </EmptyExpression>
          )}
        </Stack>
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
      {isEditing && (
        <Stack justify="space-between" align="center">
          <Stack gap={3} width="100%">
            <ButtonContainer data-is-broadcast>
              <Button
                variant="secondary"
                prefixIcon={IcoBroadcast16}
                disabled={isPendingDeletion || expressions.some(expression => !expression.field || !expression.value)}
                onClick={handleAddRiskSignalExpression}
              >
                {t('add-risk-signal')}
              </Button>
            </ButtonContainer>
            <ButtonContainer data-is-broadcast={false}>
              <Tooltip text={t('add-list-tooltip')} disabled={!!lists?.data.length}>
                <Button
                  variant="secondary"
                  prefixIcon={IcoShuffle16}
                  disabled={
                    !lists?.data.length ||
                    isPendingDeletion ||
                    expressions.some(expression => !expression.field || !expression.value)
                  }
                  onClick={handleAddListExpression}
                >
                  {t('add-list')}
                </Button>
              </Tooltip>
            </ButtonContainer>
          </Stack>
          {(isPendingChange || isPendingDeletion) && (
            <Stack align="center" gap={2} width="fit-content">
              <IcoClockSmall16 color={isPendingChange ? 'tertiary' : 'error'} />
              <Text variant="caption-1" color={isPendingChange ? 'tertiary' : 'error'} width="max-content">
                {isPendingChange ? t('pending-change') : t('pending-deletion')}
              </Text>
            </Stack>
          )}
        </Stack>
      )}
    </RulesListItem>
  );
};

const RulesListItem = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[6]};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    ${createFontStyles('body-4')}
    line-height: 240%;

    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

const EmptyExpression = styled(Stack)`
  ${({ theme }) => css`
    height: 24px;
    width: 55px;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
  `}
`;

const ButtonContainer = styled.span`
  ${({ theme }) => css`
    button[disabled] svg path {
      stroke: ${theme.color.quaternary};
    }

    &[data-is-broadcast='true'] {
      button svg path {
        stroke: none;
      }
    }

    &[data-is-broadcast='false'] {
      button[disabled] svg path {
        fill: none !important;
      }
    }
  `}
`;

export default RulesActionRow;
