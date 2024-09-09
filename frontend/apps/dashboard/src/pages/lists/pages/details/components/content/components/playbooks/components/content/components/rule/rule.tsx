import type { ListRuleField, RiskSignalRuleField, Rule } from '@onefootprint/types';
import { ListRuleOp } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListRuleChip, RiskSignalRuleChip } from 'src/components/rules-action-row/components/rule-chip';

type RuleProps = {
  rule: Rule;
};

const RuleComponent = ({ rule }: RuleProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.playbooks',
  });

  const getKeyForExpression = (expression: ListRuleField | RiskSignalRuleField) =>
    `${expression.field}-${expression.op}-${expression.value}`;

  return (
    <Stack gap={3} direction="row" flexWrap="wrap" align="center">
      <Text variant="body-3" color="primary">
        {t('if')}
      </Text>
      {rule.ruleExpression.map((expression, index) => (
        <React.Fragment key={getKeyForExpression(expression)}>
          {expression.op === ListRuleOp.isIn || expression.op === ListRuleOp.isNotIn ? (
            <ListRuleChip defaultExpression={expression as ListRuleField} />
          ) : (
            <RiskSignalRuleChip defaultExpression={expression as RiskSignalRuleField} />
          )}
          {index < rule.ruleExpression.length - 1 && <Text variant="body-3">{t('and')}</Text>}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default RuleComponent;
