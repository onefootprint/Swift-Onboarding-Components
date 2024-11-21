import type { Rule, RuleAction, RuleResult } from '@onefootprint/request-types/dashboard';

// Groups rule results into triggered/not triggered, then by RuleAction, and sorts them within that group by createdAt
// Eg: { triggered: { manual_review: [rule1, rule2], fail: [rule3] }, notTriggered: { fail: [rule4] } }
const groupRuleResults = (
  ruleResults: RuleResult[],
): Record<'triggered' | 'notTriggered', Partial<Record<RuleAction, Rule[]>>> => {
  if (ruleResults.length === 0) return { triggered: {}, notTriggered: {} };

  const formattedResults = { triggered: {}, notTriggered: {} } as Record<
    'triggered' | 'notTriggered',
    Partial<Record<RuleAction, Rule[]>>
  >;

  const sortedRuleResults = [...ruleResults].sort((a, b) => (a.rule.createdAt > b.rule.createdAt ? 1 : -1));
  sortedRuleResults.forEach(({ result, rule }) => {
    if (result) {
      if (rule.action in formattedResults.triggered) {
        (formattedResults.triggered[rule.action] as Rule[]).push(rule);
      } else {
        formattedResults.triggered[rule.action] = [rule];
      }
    } else if (rule.action in formattedResults.notTriggered) {
      (formattedResults.notTriggered[rule.action] as Rule[]).push(rule);
    } else {
      formattedResults.notTriggered[rule.action] = [rule];
    }
  });

  return formattedResults;
};

export default groupRuleResults;
