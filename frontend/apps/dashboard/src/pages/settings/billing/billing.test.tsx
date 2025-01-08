import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import { asAdminUser } from 'src/config/tests/session';
import Billing from './billing';
import { invoiceWithLineItemsFixture, invoiceWithoutLineItemsFixture, withInvoicePreview } from './billing.test.config';

describe.skip('<Billing />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/settings/billing');
    asAdminUser();
  });

  const renderBilling = () => customRender(<Billing />);

  const renderBillingAndWaitData = async () => {
    renderBilling();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isPending = table.getAttribute('aria-busy');
      expect(isPending).toBe('false');
    });
  };

  it('should render with line items and display the info text', async () => {
    withInvoicePreview(invoiceWithLineItemsFixture);
    await renderBillingAndWaitData();

    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Last updated 23 minutes ago. This is a preliminary invoice intended to provide an estimate of your usage for the month and may not include all charges for the month. The final invoice, which will reflect the actual usage and charges, will be issued and sent out at the end of the month.',
      ),
    ).toBeInTheDocument();
  });

  it('should render without line items and display the no invoice text', async () => {
    withInvoicePreview(invoiceWithoutLineItemsFixture);
    await renderBillingAndWaitData();

    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText("An invoice hasn't yet been generated.")).toBeInTheDocument();
  });
});
