import { getInvoicePreview } from '@onefootprint/fixtures/dashboard';
import type { InvoicePreview } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const invoiceWithLineItemsFixture: InvoicePreview = getInvoicePreview({
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
});

export const invoiceWithoutLineItemsFixture: InvoicePreview = getInvoicePreview({
  lineItems: [],
  lastUpdatedAt: '23 minutes ago',
});

export const withInvoicePreview = (response: InvoicePreview) => {
  return mockRequest({
    method: 'get',
    path: '/org/invoice_preview',
    response,
  });
};
