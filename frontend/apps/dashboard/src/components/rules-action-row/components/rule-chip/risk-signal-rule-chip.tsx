import { IcoCloseSmall16 } from '@onefootprint/icons';
import type { ListRuleField, RiskSignalRuleField, RiskSignalRuleOp } from '@onefootprint/types';
import { IconButton, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import OpSelect from './components/op-select';
import RiskSignalSelect from './components/risk-signal-select';

type RiskSignalRuleChipProps = {
  defaultExpression: RiskSignalRuleField;
  isEditing?: boolean;
  onDelete?: () => void;
  onChange?: (expression: RiskSignalRuleField | ListRuleField) => void;
};

const RiskSignalRuleChip = ({ isEditing, defaultExpression, onDelete, onChange }: RiskSignalRuleChipProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'details.rules.action-row.rule-chip',
  });
  const [ruleExpression, setRuleExpression] = useState<RiskSignalRuleField>(defaultExpression);

  useEffect(() => {
    setRuleExpression(defaultExpression);
  }, [defaultExpression]);

  const handleFieldChange = (newField: string) => {
    setRuleExpression(currentExpression => {
      const newExpression = {
        ...currentExpression,
        field: newField,
      };
      onChange?.(newExpression);
      return newExpression;
    });
  };

  const handleOpChange = (newOp: string) => {
    setRuleExpression(currentExpression => {
      const newExpression = {
        ...currentExpression,
        op: newOp as RiskSignalRuleOp,
      };
      onChange?.(newExpression);
      return newExpression;
    });
  };

  return isEditing ? (
    <EditContainer>
      <ExpressionContainer role="group" aria-label={ruleExpression.field} data-is-editing={isEditing}>
        <RiskSignalSelect value={ruleExpression.field} onChange={handleFieldChange} />
        <OpSelect defaultOp={ruleExpression.op} onChange={handleOpChange} />
        <Text variant="caption-1" color="tertiary" paddingLeft={2}>
          {t('risk-signal.value-placeholder')}
        </Text>
      </ExpressionContainer>
      {onDelete && (
        <DeleteContainer>
          <IconButton aria-label="Delete field" onClick={onDelete}>
            <IcoCloseSmall16 color="tertiary" />
          </IconButton>
        </DeleteContainer>
      )}
    </EditContainer>
  ) : (
    <ExpressionContainer role="group" aria-label={ruleExpression.field}>
      <Text variant="caption-1" minWidth="fit-content">
        {ruleExpression.field}
      </Text>
      <Text variant="caption-1" minWidth="fit-content">
        {t(`op.${ruleExpression.op}` as ParseKeys<'common'>)}
      </Text>
      <Text variant="caption-1" color="tertiary">
        {t('risk-signal.value-placeholder')}
      </Text>
    </ExpressionContainer>
  );
};

const ExpressionContainer = styled(Stack)`
  ${({ theme }) => css`
    height: fit-content;
    min-width: fit-content;
    align-items: center;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[1]} ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.full};

    &[data-is-editing='true'] {
      gap: ${theme.spacing[1]};
      padding-left: ${theme.spacing[3]};
    }
  `}
`;

const EditContainer = styled(Stack)`
  ${({ theme }) => css`
    height: fit-content;
    min-width: fit-content;
    align-items: center;
    border-radius: ${theme.borderRadius.full};
    padding-right: ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

const DeleteContainer = styled.div`
  ${({ theme }) => css`
    height: 16px;
    width: 16px;
    display: flex;
    align-items: center;
    margin-left: ${theme.spacing[1]};

    > button:hover:enabled {
      background: transparent;
    }
  `}
`;

export default RiskSignalRuleChip;
