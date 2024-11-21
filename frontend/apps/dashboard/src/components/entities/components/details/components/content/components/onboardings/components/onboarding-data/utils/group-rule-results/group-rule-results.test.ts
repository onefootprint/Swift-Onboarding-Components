import type { RuleResult } from '@onefootprint/request-types/dashboard';
import groupRuleResults from './group-rule-results';
import { rule1, rule2, rule3 } from './group-rule-results.test.config';

describe('groupRuleResults', () => {
  it('should return empty objects when input array is empty', () => {
    const result = groupRuleResults([]);
    expect(result).toEqual({
      triggered: {},
      notTriggered: {},
    });
  });

  it('should group triggered and not triggered rules by action and sort them by createdAt within each group', () => {
    const ruleResults: RuleResult[] = [
      { result: true, rule: rule1 },
      { result: false, rule: rule2 },
      { result: false, rule: rule3 },
      { result: true, rule: rule3 },
    ];
    const result = groupRuleResults(ruleResults);
    expect(result).toEqual({
      triggered: {
        manual_review: [rule1],
        fail: [rule3],
      },
      notTriggered: {
        fail: [rule2, rule3],
      },
    });
  });
});
