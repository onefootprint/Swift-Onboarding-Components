import { getRule } from '@onefootprint/fixtures/dashboard';
import type { Rule } from '@onefootprint/request-types/dashboard';

export const rule1: Rule = getRule({
  action: 'manual_review',
  createdAt: '2024-01-01T00:00:00.000Z',
});

export const rule2: Rule = getRule({
  action: 'fail',
  createdAt: '2024-01-02T00:00:00.000Z',
});

export const rule3: Rule = getRule({
  action: 'fail',
  createdAt: '2024-01-03T00:00:00.000Z',
});
