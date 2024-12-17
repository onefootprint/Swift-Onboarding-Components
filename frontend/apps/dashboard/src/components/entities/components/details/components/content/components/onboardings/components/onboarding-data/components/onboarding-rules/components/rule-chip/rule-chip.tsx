import type { List, RuleExpressionCondition } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

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
    <div className="h-fit min-w-fit flex items-center gap-2 py-0.5 px-3 bg-primary rounded-full border border-solid border-tertiary overflow-hidden">
      <span className="text-caption-1 min-w-fit">{ruleExpression.field}</span>
      <span className="text-caption-1 min-w-fit">{getOperator()}</span>
      <span className="text-caption-1 text-tertiary min-w-fit">
        {isListRule
          ? (listName ?? t('value.list-fallback-value', { value: ruleExpression.value }))
          : t('value.risk-signal-value')}
      </span>
    </div>
  );
};

export default RuleChip;
