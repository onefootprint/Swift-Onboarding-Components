import { useIntl } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

type PreviewInvoice = {
  lineItems: InvoiceItem[];
  lastUpdatedAt?: string;
};

export type InvoiceItem = {
  id: string;
  description?: string;
  quantity: number;
  unitPriceCents?: string;
  notionalCents: number;
};

const getPreviewInvoice = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<PreviewInvoice>({
    headers: authHeaders,
    method: 'GET',
    url: '/org/invoice_preview',
  });

  return response;
};

const useGetPreviewInvoice = () => {
  const { authHeaders } = useSession();
  const { formatRelativeDate } = useIntl();

  return useQuery(['invoice-preview', authHeaders], () => getPreviewInvoice(authHeaders), {
    select: data => ({
      ...data,
      lastUpdatedAt: data?.lastUpdatedAt ? formatRelativeDate(new Date(data.lastUpdatedAt)) : null,
    }),
  });
};

export default useGetPreviewInvoice;
