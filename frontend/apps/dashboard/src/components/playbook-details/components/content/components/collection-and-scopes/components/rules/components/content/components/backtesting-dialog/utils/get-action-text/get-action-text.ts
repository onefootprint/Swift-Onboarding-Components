import { BacktestingRuleAction } from '@onefootprint/types';

const getActionText = (action: BacktestingRuleAction) => {
  const actionTexts: Record<BacktestingRuleAction, string> = {
    [BacktestingRuleAction.fail]: 'Fail',
    [BacktestingRuleAction.manualReview]: 'Fail + Manual review',
    [BacktestingRuleAction.stepUp]: 'Step-up',
    [BacktestingRuleAction.passWithManualReview]: 'Pass + Manual review',
    [BacktestingRuleAction.pass]: 'Pass',
  };
  return actionTexts[action] || '';
};

export default getActionText;
