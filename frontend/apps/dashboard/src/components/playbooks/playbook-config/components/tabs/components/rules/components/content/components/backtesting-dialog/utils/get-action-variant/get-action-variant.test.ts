import { BacktestingRuleAction } from '@onefootprint/types';

import getActionVariant from './get-action-variant';

describe('getActionVariant', () => {
  it('should return the error variant when the fail action is passed in', () => {
    expect(getActionVariant(BacktestingRuleAction.fail)).toEqual('error');
  });

  it('should return the info variant when the step_up action is passed in', () => {
    expect(getActionVariant(BacktestingRuleAction.stepUp)).toEqual('info');
  });

  it('should return the info variant when the manual_review action is passed in', () => {
    expect(getActionVariant(BacktestingRuleAction.manualReview)).toEqual('warning');
  });

  it('should return the success variant when the pass_with_manual_review action is passed in', () => {
    expect(getActionVariant(BacktestingRuleAction.passWithManualReview)).toEqual('success');
  });

  it('should return the neutral variant when the pass action is passed in', () => {
    expect(getActionVariant(BacktestingRuleAction.pass)).toEqual('success');
  });
});
