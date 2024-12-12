import { Box, Button, Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';

import CreateDialog from './components/create-dialog';
import Header from './components/header';
import List from './components/list';
import useAllowedDomains from './hooks/use-allowed-domains';

const DomainRestrictions = () => {
  const { t } = useTranslation('domain-restrictions');
  const { hasPermission } = usePermissions();
  const { data, isPending, error } = useAllowedDomains();
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
            <Text variant="heading-2">{t('header.title')}</Text>
            <Text variant="body-2" color="secondary">
              {t('header.subtitle')}
            </Text>
          </Box>
          <Box>
            {hasPermission('onboarding_configuration') && <Button onClick={handleOpen}>{t('header.cta')}</Button>}
          </Box>
        </Stack>
        <Stack
          aria-busy={isPending}
          borderColor="tertiary"
          borderRadius="default"
          borderWidth={1}
          direction="column"
          gap={5}
          padding={5}
        >
          <Header hasRestrictions={hasRestrictions} isPending={isPending} />
          <List allowedDomains={data?.allowedOrigins} error={error} isPending={isPending} />
        </Stack>
        <CreateDialog allowedDomains={data?.allowedOrigins} onClose={handleClose} open={addDialogOpen} />
      </Box>
    </>
  );
};

export default DomainRestrictions;
