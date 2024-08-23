import { customRender, screen } from '@onefootprint/test-utils';
import Billing from './billing';

const renderBilling = () => customRender(<Billing />);

import useGetPreviewInvoice from './hooks/use-get-preview-invoice';

jest.mock('./hooks/use-get-preview-invoice');

const mockInvoiceDataWithLineItems = {
  lineItems: [
    {
      id: 'ii_1PpYzJGerPBo41PtciJQwXDR',
      description: 'Hot vaults',
      quantity: 34229,
      unitPriceCents: '8',
      notionalCents: 273832,
    },
    {
      id: 'ii_1PpYzJGerPBo41PtxkRIno1q',
      description: 'KYC',
      quantity: 13373,
      unitPriceCents: '55',
      notionalCents: 735515,
    },
  ],
  lastUpdatedAt: '23 minutes ago',
};

const mockInvoiceDataWithoutLineItems = {
  lineItems: [],
  lastUpdatedAt: '23 minutes ago',
};

describe.skip('<Billing />', () => {
  it('should render with line items and display the info text', () => {
    (useGetPreviewInvoice as jest.Mock).mockReturnValue({
      data: mockInvoiceDataWithLineItems,
      isLoading: false,
      isError: false,
    });

    renderBilling();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Last updated 23 minutes ago. This is a preliminary invoice intended to provide an estimate of your usage for the month and may not include all charges for the month. The final invoice, which will reflect the actual usage and charges, will be issued and sent out at the end of the month.',
      ),
    ).toBeInTheDocument();
  });

  it('should render without line items and display the no invoice text', () => {
    (useGetPreviewInvoice as jest.Mock).mockReturnValue({
      data: mockInvoiceDataWithoutLineItems,
      isLoading: false,
      isError: false,
    });

    renderBilling();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText("An invoice hasn't yet been generated.")).toBeInTheDocument();
  });
});
