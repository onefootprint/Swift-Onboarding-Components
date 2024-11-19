import type { UIState } from '@onefootprint/design-tokens';
import { BacktestingRuleAction } from '@onefootprint/types';

const getActionVariant = (action: BacktestingRuleAction) => {
  const actionVariants: Record<BacktestingRuleAction, UIState> = {
    [BacktestingRuleAction.fail]: 'error',
    [BacktestingRuleAction.manualReview]: 'warning',
    [BacktestingRuleAction.stepUp]: 'info',
    [BacktestingRuleAction.passWithManualReview]: 'success',
    [BacktestingRuleAction.pass]: 'success',
  };
  return actionVariants[action] || 'neutral';
};

export default getActionVariant;
