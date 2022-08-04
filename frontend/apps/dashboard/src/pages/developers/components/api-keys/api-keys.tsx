import { useToggle, useTranslation } from 'hooks';
import React from 'react';
import { getErrorMessage } from 'request';
import EncryptedCell from 'src/components/encrypted-cell';
import styled, { css } from 'styled-components';
import { Badge, Box, Button, Divider, Table, TableRow, Typography } from 'ui';

import CreateApiKeyDialog from './components/create-api-key-dialog';
import useApiKeys, { EnhancedApiKey } from './hooks/use-api-keys';

const ApiKeys = () => {
  const [isOpen, openDialog, closeDialog] = useToggle(false);
  const { isLoading, error, data } = useApiKeys();
  const { t } = useTranslation('pages.developers.api-keys');
  const columns = [
    { text: t('table.header.name'), width: '15%' },
    { text: t('table.header.token'), width: '25%' },
    { text: t('table.header.last-used'), width: '17.5%' },
    { text: t('table.header.created'), width: '17.5%' },
    { text: t('table.header.status'), width: '15%' },
    { text: '', width: '10%' },
  ];

  return (
    <section data-testid="api-keys-section">
      <Header>
        <Box>
          <Typography variant="heading-2" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
        <Button onClick={openDialog} variant="secondary" size="small">
          {t('header.cta')}
        </Button>
      </Header>
      <StyledDivider />
      <Table
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
        getKeyForRow={(apiKey: EnhancedApiKey) => apiKey.id}
        isLoading={isLoading}
        items={data}
        loadingAriaLabel={t('table.loading.aria-label')}
        renderTr={({ item }: TableRow<EnhancedApiKey>) => (
          <>
            <td>{item.name}</td>
            <td>{item.isDecrypted ? 'lorem' : <EncryptedCell />}</td>
            <td>{item.lastUsedAt || '--'}</td>
            <td>{item.createdAt}</td>
            <td>
              <Badge variant="success">{item.status}</Badge>
            </td>
            <td />
          </>
        )}
      />
      <CreateApiKeyDialog open={isOpen} onClose={closeDialog} />
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]}px;
    justify-content: space-between;
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[7]}px 0;
  `}
`;

export default ApiKeys;
