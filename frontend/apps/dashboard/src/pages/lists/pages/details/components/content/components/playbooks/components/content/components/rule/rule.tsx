import type { Rule, RuleExpressionCondition } from '@onefootprint/request-types/dashboard';
// TODO: deprecate, this is because ListRuleChip and RiskSignalRuleChip are typed with old types
import type { ListRuleField, RiskSignalRuleField } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListRuleChip, RiskSignalRuleChip } from 'src/components/rules-action-row/components/rule-chip';

type RuleProps = {
  rule: Rule;
};

const RuleComponent = ({ rule }: RuleProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.playbooks' });

  const getKeyForExpression = (expression: RuleExpressionCondition) =>
    `${expression.field}-${expression.op}-${expression.value}`;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="text-primary text-body-3">{t('if')}</div>
      {rule.ruleExpression.map((expression, index) => (
        <React.Fragment key={getKeyForExpression(expression)}>
          {expression.op === 'is_in' || expression.op === 'is_not_in' ? (
            <ListRuleChip defaultExpression={expression as ListRuleField} />
          ) : (
            <RiskSignalRuleChip defaultExpression={expression as RiskSignalRuleField} />
          )}
          {index < rule.ruleExpression.length - 1 && <div className="text-primary text-body-3">{t('and')}</div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RuleComponent;
