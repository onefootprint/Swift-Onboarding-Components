import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import FinancialPermissions from './financial-permissions';

describe('<FinancialPermissions />', () => {
  it('renders financial permissions correctly', () => {
    const permissions = ['card.*.number_last4', 'card.*.issuer', 'bank.*.name', 'bank.*.account_type'];

    customRender(<FinancialPermissions title="Card Details" permissions={permissions as DataIdentifier[]} />);

    // Check title
    const titleElement = screen.getByText('Card Details');
    expect(titleElement).toBeInTheDocument();

    // Check translated permissions
    const last4Element = screen.getByText('Last 4 digits');
    expect(last4Element).toBeInTheDocument();

    const issuerElement = screen.getByText('Issuer');
    expect(issuerElement).toBeInTheDocument();

    const bankNameElement = screen.getByText('Bank name');
    expect(bankNameElement).toBeInTheDocument();

    const accountTypeElement = screen.getByText('Account type');
    expect(accountTypeElement).toBeInTheDocument();
  });
});
