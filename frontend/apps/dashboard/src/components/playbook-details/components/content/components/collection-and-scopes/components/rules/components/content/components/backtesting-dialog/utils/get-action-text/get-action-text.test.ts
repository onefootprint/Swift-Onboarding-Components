import { BacktestingRuleAction } from '@onefootprint/types';

import getActionText from './get-action-text';

describe('getActionText', () => {
  it('should return the correct text when the fail action is passed in', () => {
    expect(getActionText(BacktestingRuleAction.fail)).toEqual('Fail');
  });

  it('should return the correct text when the step_up action is passed in', () => {
    expect(getActionText(BacktestingRuleAction.stepUp)).toEqual('Step-up');
  });

  it('should return the correct text when the manual_review action is passed in', () => {
    expect(getActionText(BacktestingRuleAction.manualReview)).toEqual('Fail + Manual review');
  });

  it('should return the correct text when the pass_with_manual_review action is passed in', () => {
    expect(getActionText(BacktestingRuleAction.passWithManualReview)).toEqual('Pass + Manual review');
  });

  it('should return the correct text when the pass action is passed in', () => {
    expect(getActionText(BacktestingRuleAction.pass)).toEqual('Pass');
  });
});
