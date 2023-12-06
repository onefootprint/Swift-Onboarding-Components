import isDomainAllowed from './verify-allowed-domain';

describe('isDomainAllowed', () => {
  it.each`
    url                                      | list                                | output
    ${'http://localhost:3002/route?param=1'} | ${['https://localhost:3002']}       | ${true}
    ${'onefootprint.com'}                    | ${['www.onefootprint.com']}         | ${true}
    ${'onefootprint.com'}                    | ${['https://www.onefootprint.com']} | ${true}
    ${'www.onefootprint.com'}                | ${['www.onefootprint.com']}         | ${true}
    ${'http://www.onefootprint.com/a/b'}     | ${['www.onefootprint.com']}         | ${true}
    ${'https://www.onefootprint.com'}        | ${['www.onefootprint.com']}         | ${true}
    ${'https://www.onefootprint.com'}        | ${['onefootprint.com']}             | ${true}
    ${''}                                    | ${['www.onefootprint.com']}         | ${false}
    ${'not-adomain'}                         | ${['www.onefootprint.com']}         | ${false}
  `(`for $url`, ({ url, list, output }) => {
    expect(isDomainAllowed(url, list)).toBe(output);
  });
});
