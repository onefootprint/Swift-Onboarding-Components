import { describe, expect, test as it } from 'bun:test';

import sandboxIdEditRules from './editable-sandbox-rules';

describe('sandboxIdEditRules', () => {
  it.each([
    { obj: {}, step: 'emailIdentification', x: true },
    { obj: { 'id.email': 'x' }, step: 'emailIdentification', x: false },
    {
      obj: { 'id.email': 'x', 'id.phone_number': 'x' },
      step: 'emailIdentification',
      x: false,
    },
    { obj: {}, step: 'phoneIdentification', x: false },
    { obj: { 'id.email': 'x' }, step: 'phoneIdentification', x: true },
    {
      obj: { 'id.email': 'x', 'id.phone_number': 'x' },
      step: 'phoneIdentification',
      x: true,
    },
    { obj: {}, step: 'smsChallenge', x: false },
    { obj: { 'id.email': 'x' }, step: 'smsChallenge', x: false },
    {
      obj: { 'id.email': 'x', 'id.phone_number': 'x' },
      step: 'smsChallenge',
      x: true,
    },
  ])('.', ({ obj, step, x }) => {
    expect(sandboxIdEditRules(obj)(step)).toBe(x);
  });
});
