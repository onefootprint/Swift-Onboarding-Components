import { RoleScopeKind } from '@onefootprint/types';
import { Box, Button, Stack, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';

import CreateDialog from './components/create-dialog';
import Header from './components/header';
import List from './components/list';
import useAllowedDomains from './hooks/use-allowed-domains';

const DomainRestrictions = () => {
  const { t } = useTranslation('domain-restrictions');
  const { hasPermission } = usePermissions();
  const { data, isLoading, error } = useAllowedDomains();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const hasRestrictions = !!data?.allowedOrigins?.length;

  const handleOpen = () => setAddDialogOpen(true);

  const handleClose = () => setAddDialogOpen(false);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box>
        <Stack justify="space-between" align="center" marginBottom={5}>
          <Box>
            <Typography variant="heading-2">{t('header.title')}</Typography>
            <Typography variant="body-2" color="secondary">
              {t('header.subtitle')}
            </Typography>
          </Box>
          <Box>
            {hasPermission(RoleScopeKind.onboardingConfiguration) && (
              <Button size="small" onClick={handleOpen}>
                {t('header.cta')}
              </Button>
            )}
          </Box>
        </Stack>
        <Stack
          aria-busy={isLoading}
          borderColor="tertiary"
          borderRadius="default"
          borderWidth={1}
          direction="column"
          gap={5}
          padding={5}
        >
          <Header hasRestrictions={hasRestrictions} isLoading={isLoading} />
          <List
            allowedDomains={data?.allowedOrigins}
            error={error}
            isLoading={isLoading}
          />
        </Stack>
        <CreateDialog
          allowedDomains={data?.allowedOrigins}
          onClose={handleClose}
          open={addDialogOpen}
        />
      </Box>
    </>
  );
};

export default DomainRestrictions;
