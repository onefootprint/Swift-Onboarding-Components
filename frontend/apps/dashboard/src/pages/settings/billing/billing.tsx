import { IcoInfo16 } from '@onefootprint/icons';
import { Box, Divider, Stack, Table, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';
import useGetPreviewInvoice, { type InvoiceItem } from './hooks/use-get-preview-invoice';

const dollarAmountFromCents = (v: number) => {
  const vString = (v / 100).toFixed(2).toString();
  return `$${withCommas(vString)}`;
};
const withCommas = (v: string) => v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const Billing = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.billing' });
  const { data: invoice, isPending, isError } = useGetPreviewInvoice();
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
      <Stack direction="column" gap={7}>
        <Text variant="heading-2">{t('meta-title')}</Text>
        <Stack direction="column">
          <Text variant="heading-5">{t('title')}</Text>
          <Text variant="body-2" marginTop={2}>
            {t('subtitle')}
          </Text>
          <Divider marginTop={5} marginBottom={7} />
          <TableContainer direction="column">
            <Table<InvoiceItem>
              aria-label={t('table.aria-label')}
              columns={columns}
              emptyStateText={isError ? t('table.error') : t('table.no-results')}
              getKeyForRow={(r: InvoiceItem) => r.id}
              isLoading={isPending}
              items={invoice?.lineItems}
              renderTr={({ item }) => (
                <>
                  <td>{item.description}</td>
                  <QuantityTd>{withCommas(item.quantity.toString())}</QuantityTd>
                  <QuantityTd>
                    {dollarAmountFromCents(item.unitPriceCents ? Number.parseFloat(item.unitPriceCents) : 0)}
                  </QuantityTd>
                  <QuantityTd>{dollarAmountFromCents(item.notionalCents)}</QuantityTd>
                </>
              )}
            />
            {invoice?.lineItems.length ? (
              <Stack gap={5} padding={5} direction="column">
                <Stack gap={11} justifyContent="right">
                  <Text variant="label-3">{t('table.subtotal')}</Text>
                  <Text variant="label-3">{totalAmountDue ? dollarAmountFromCents(totalAmountDue) : '-'}</Text>
                </Stack>
                <InfoContainer padding={5} gap={3}>
                  <Box marginTop={1}>
                    <IcoInfo16 />
                  </Box>
                  <Text variant="body-3" color="secondary" lineHeight={'20px'}>
                    {t('table.info', { lastUpdatedAt })}
                  </Text>
                </InfoContainer>
              </Stack>
            ) : null}
          </TableContainer>
        </Stack>
      </Stack>
    </>
  );
};

const TableContainer = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.secondary};
    border: 1px solid ${theme.borderColor.tertiary};

    table {
      // To sit on top of the border of the container
      margin: -1px;
      width: calc(100% + 2px);
    }

    tbody {
      background-color: ${theme.backgroundColor.primary};
    }
  `};
`;

const InfoContainer = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    border: 1px solid ${theme.borderColor.tertiary};
  `};
`;

const QuantityTd = styled.td`
  text-align: right;
`;

export default Billing;
