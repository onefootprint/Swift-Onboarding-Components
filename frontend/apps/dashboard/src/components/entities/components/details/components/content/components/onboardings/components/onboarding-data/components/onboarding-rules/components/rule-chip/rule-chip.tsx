import type { List, RuleExpressionCondition } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import styled, { css } from 'styled-components';

type RuleChipProps = {
  ruleExpression: RuleExpressionCondition;
  lists?: List[];
};

const RuleChip = ({ ruleExpression, lists }: RuleChipProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.rules.rule-row' });
  const isListRule = ruleExpression.op === 'is_in' || ruleExpression.op === 'is_not_in';
  const listName = lists?.find(({ id }) => id === ruleExpression.value)?.alias;

  const getOperator = () => {
    if (ruleExpression.op === 'eq') return t('op.eq');
    if (ruleExpression.op === 'not_eq') return t('op.not-eq');
    if (ruleExpression.op === 'is_in') return t('op.is-in');
    if (ruleExpression.op === 'is_not_in') return t('op.is-not-in');
  };

  return (
    <ExpressionContainer>
      <Text variant="caption-1" minWidth="fit-content">
        {ruleExpression.field}
      </Text>
      <Text variant="caption-1" minWidth="fit-content">
        {getOperator()}
      </Text>
      <Text variant="caption-1" color="tertiary" minWidth="fit-content">
        {isListRule
          ? (listName ?? t('value.list-fallback-value', { value: ruleExpression.value }))
          : t('value.risk-signal-value')}
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
    overflow: hidden;
  `}
`;

export default RuleChip;
