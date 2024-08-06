import { customRender, screen } from '@onefootprint/test-utils';

import OtherTenantSummary from '.';

const otherTenantSummary = {
  numMatches: 3,
  numTenants: 2,
};

const renderOtherTenantSummary = (isSameTenantDataEmpty: boolean) =>
  customRender(<OtherTenantSummary summary={otherTenantSummary} isSameTenantDataEmpty={isSameTenantDataEmpty} />);

describe('OtherTenantSummary', () => {
  it('should show the other tenant data', () => {
    renderOtherTenantSummary(false);
    expect(screen.getByTestId('other-tenant-summary')).toHaveTextContent('Plus 3 more matches in 2 other companies');
  });

  it('other tenant data when same tenant is empty', () => {
    renderOtherTenantSummary(true);
    expect(screen.getByTestId('other-tenant-summary')).toHaveTextContent('3 matches in 2 other companies');
  });
});
