import sandboxIdEditRules from './editable-sandbox-rules';

describe('sandboxIdEditRules', () => {
  it.each`
    obj                                            | step                     | output
    ${{}}                                          | ${'emailIdentification'} | ${true}
    ${{ 'id.email': 'x' }}                         | ${'emailIdentification'} | ${false}
    ${{ 'id.email': 'x', 'id.phone_number': 'x' }} | ${'emailIdentification'} | ${false}
    ${{}}                                          | ${'phoneIdentification'} | ${false}
    ${{ 'id.email': 'x' }}                         | ${'phoneIdentification'} | ${true}
    ${{ 'id.email': 'x', 'id.phone_number': 'x' }} | ${'phoneIdentification'} | ${true}
    ${{}}                                          | ${'smsChallenge'}        | ${false}
    ${{ 'id.email': 'x' }}                         | ${'smsChallenge'}        | ${false}
    ${{ 'id.email': 'x', 'id.phone_number': 'x' }} | ${'smsChallenge'}        | ${true}
  `(`editable $output when $step + $obj`, ({ obj, step, output }) => {
    expect(sandboxIdEditRules(obj)(step)).toBe(output);
  });
});
