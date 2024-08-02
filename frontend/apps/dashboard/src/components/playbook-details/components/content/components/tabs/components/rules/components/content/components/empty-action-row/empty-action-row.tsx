import { IcoBroadcast16, IcoDotsHorizontal16, IcoShuffle16, IcoTrash16 } from '@onefootprint/icons';
import type { ListRuleField, RiskSignalRuleField, RuleAction } from '@onefootprint/types';
import { ListRuleOp, RiskSignalRuleOp } from '@onefootprint/types';
import { Button, IconButton, Stack, Text } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui/src/utils/mixins/mixins';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListRuleChip, RiskSignalRuleChip } from 'src/components/rules-action-row/components/rule-chip';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useLists from 'src/hooks/use-lists';

import type { AddedRuleWithId } from '../..';

export type EmptyActionRowProps = {
  action: RuleAction;
  tempId: string;
  onEdit: (rule: AddedRuleWithId) => void;
  onDelete: (id: string) => void;
};

const EmptyActionRow = ({ action, tempId, onEdit, onDelete }: EmptyActionRowProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.rules.action-row' });
  const { data: lists } = useLists();
  const [expressions, setExpressions] = useState<(RiskSignalRuleField | ListRuleField)[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  useEffectOnce(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  const handleChange = (newExpression: (RiskSignalRuleField | ListRuleField)[]) => {
    onEdit({
      ruleAction: action,
      ruleExpression:
        newExpression.length && !newExpression[newExpression.length - 1].field // Remove empty trailing fields
          ? newExpression.slice(0, -1)
          : newExpression,
      tempId,
    });
  };

  // Using index instead of expression in case the rule has the same expression multiple times
  const handleChangeExpression = (index: number) => (newExpression: RiskSignalRuleField | ListRuleField) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = newExpression;
      handleChange(newExpressions);
      return newExpressions;
    });
  };

  const handleDeleteExpression = (index: number) => {
    setExpressions(currentExpressions => {
      const newExpressions = currentExpressions.slice(0, index).concat(currentExpressions.slice(index + 1));
      handleChange(newExpressions);
      return newExpressions;
    });
  };

  const handleAddRiskSignalExpression = () => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions, { field: '', op: RiskSignalRuleOp.eq, value: true }];
      handleChange(newExpressions);
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
      handleChange(newExpressions);
      return newExpressions;
    });
  };

  return (
    <RulesListEmptyItem ref={ref} role="row" aria-label={t('empty-aria-label')}>
      <Stack justify="space-between" align="start">
        <Stack align="center" rowGap={2} columnGap={3} flexWrap="wrap">
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
                    isEditing
                    defaultExpression={expression}
                    lists={lists?.data}
                    onDelete={() => handleDeleteExpression(index)}
                    onChange={handleChangeExpression(index)}
                  />
                ) : (
                  <RiskSignalRuleChip
                    isEditing
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
        <div>
          <IconButton aria-label="delete" onClick={() => onDelete(tempId)}>
            <IcoTrash16 color="error" />
          </IconButton>
        </div>
      </Stack>
      <Stack gap={3} width="100%">
        <Button
          variant="secondary"
          prefixIcon={IcoBroadcast16}
          disabled={expressions.some(expression => !expression.field || !expression.value)}
          onClick={handleAddRiskSignalExpression}
        >
          {t('add-risk-signal')}
        </Button>
        <Button
          variant="secondary"
          prefixIcon={IcoShuffle16}
          disabled={expressions.some(expression => !expression.field || !expression.value)}
          onClick={handleAddListExpression}
        >
          {t('add-list')}
        </Button>
      </Stack>
    </RulesListEmptyItem>
  );
};

const RulesListEmptyItem = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[6]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[4]}
      ${theme.spacing[4]};
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

export default EmptyActionRow;
