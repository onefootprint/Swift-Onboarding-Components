import { getOrgInvoicePreviewOptions } from '@onefootprint/axios/dashboard';
import { useIntl } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import type { InvoicePreview, LineItem } from '@onefootprint/request-types/dashboard';
import { Divider, Table } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import useSession from 'src/hooks/use-session';

const dollarAmountFromCents = (v: number) => {
  const vString = (v / 100).toFixed(2).toString();
  return `$${withCommas(vString)}`;
};
const withCommas = (v: string) => v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const Billing = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.billing' });
  const { formatRelativeDate } = useIntl();
  const {
    data: invoice,
    isPending,
    error,
  } = useQuery({
    ...getOrgInvoicePreviewOptions(),
    select: (data: InvoicePreview) => ({
      ...data,
      lastUpdatedAt: data?.lastUpdatedAt ? formatRelativeDate(new Date(data.lastUpdatedAt)) : null,
    }),
  });

  const {
    data: { user, org },
  } = useSession();
  const { isAdmin } = usePermissions();

  const columns = [
    { text: t('table.header.description'), width: '40%' },
    { text: t('table.header.quantity'), width: '15%', justifyContent: 'right' },
    { text: t('table.header.unit-price'), width: '15%', justifyContent: 'right' },
    { text: t('table.header.amount'), width: '15%', justifyContent: 'right' },
  ];

  const totalAmountDue = invoice?.lineItems?.map(li => li.notionalCents || 0).reduce((a, b) => a + b, 0);
  const lastUpdatedAt = invoice?.lastUpdatedAt || '-';
  const shouldShowBilling = (org?.id === 'org_AiK8peOw9mrqsb6yeHWEG8' && isAdmin) || user?.isFirmEmployee;

  if (!shouldShowBilling || !org?.id) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <div className="flex flex-col gap-6">
        <h1 className="text-heading-2">{t('meta-title')}</h1>
        <div className="flex flex-col">
          <p className="text-heading-5">{t('title')}</p>
          <p className="text-body-2 mt-1">{t('subtitle')}</p>
          <Divider className="mt-4 mb-6" />
          <div className="flex flex-col rounded border border-solid border-tertiary">
            <div className="-m-[1px] w-[calc(100%+2px)]">
              <Table<LineItem>
                aria-label={t('table.aria-label')}
                columns={columns}
                emptyStateText={error ? t('table.error') : t('table.no-results')}
                getKeyForRow={(r: LineItem) => r.id}
                isLoading={isPending}
                items={invoice?.lineItems}
                renderTr={({ item }) => (
                  <>
                    <td>{item.description}</td>
                    <td className="text-right">{withCommas(item.quantity.toString())}</td>
                    <td className="text-right">
                      {dollarAmountFromCents(item.unitPriceCents ? Number.parseFloat(item.unitPriceCents) : 0)}
                    </td>
                    <td className="text-right">{dollarAmountFromCents(item.notionalCents)}</td>
                  </>
                )}
              />
            </div>
            {invoice?.lineItems.length ? (
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col items-end gap-24">
                  <p className="text-label-3">{t('table.subtotal')}</p>
                  <p className="text-label-3">{totalAmountDue ? dollarAmountFromCents(totalAmountDue) : '-'}</p>
                </div>
                <div className="flex gap-2 p-4 rounded bg-primary border border-solid border-tertiary">
                  <div className="flex mt-0.5">
                    <IcoInfo16 />
                  </div>
                  <p className="text-body-3 text-secondary leading-5">{t('table.info', { lastUpdatedAt })}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Billing;
