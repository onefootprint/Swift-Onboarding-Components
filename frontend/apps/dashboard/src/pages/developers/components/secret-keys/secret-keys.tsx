import { useToggle, useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, Divider, Table, Typography } from 'ui';

import CreateSecretKeyDialog from './componets/create-secret-key-dialog';

const SecretKeys = () => {
  const [isOpen, openDialog, closeDialog] = useToggle(false);
  const { t } = useTranslation('pages.developers.secret-keys');
  const columns = [
    { text: t('table.header.name'), width: '20%' },
    { text: t('table.header.token'), width: '20%' },
    { text: t('table.header.last-used'), width: '20%' },
    { text: t('table.header.created'), width: '20%' },
    { text: t('table.header.status'), width: '20%' },
  ];

  return (
    <>
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
        getKeyForRow={(secretKey: any) => secretKey.name}
        renderTr={() => (
          <>
            <td />
            <td />
            <td />
            <td />
          </>
        )}
      />
      <CreateSecretKeyDialog open={isOpen} onClose={closeDialog} />
    </>
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

export default SecretKeys;
