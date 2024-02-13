import sandboxIdEditRules from './editable-sandbox-rules';

describe('sandboxIdEditRules', () => {
  it.each([
    { bootstrapData: {}, step: 'emailIdentification', x: true },
    {
      bootstrapData: { email: 'x' },
      step: 'emailIdentification',
      x: false,
    },
    {
      bootstrapData: { email: 'x', phoneNumber: 'x' },
      step: 'emailIdentification',
      x: false,
    },
    { bootstrapData: {}, step: 'phoneIdentification', x: false },
    {
      bootstrapData: { email: 'x' },
      step: 'phoneIdentification',
      x: true,
    },
    {
      bootstrapData: { email: 'x', phoneNumber: 'x' },
      step: 'phoneIdentification',
      x: true,
    },
    { bootstrapData: {}, step: 'smsChallenge', x: false },
    { bootstrapData: { email: 'x' }, step: 'smsChallenge', x: false },
    {
      bootstrapData: { email: 'x', phoneNumber: 'x' },
      step: 'smsChallenge',
      x: true,
    },
  ])('.', ({ bootstrapData, step, x }) => {
    expect(sandboxIdEditRules(step, bootstrapData)).toBe(x);
  });
});
