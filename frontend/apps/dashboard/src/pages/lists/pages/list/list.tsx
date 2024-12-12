import { getOrgListsOptions } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { Button } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import useSession from 'src/hooks/use-session';
import CreateDialog from './components/create-dialog';
import Table from './components/table';

const List = () => {
  const { t } = useTranslation('lists', { keyPrefix: 'list' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const listsQuery = useQuery(getOrgListsOptions());
  const { data, error, isPending } = listsQuery;
  const { data: session } = useSession();

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  if (!session?.user?.isFirmEmployee) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1 max-w-[650px]">
          <h2 className="text-heading-2 text-primary">{t('header.title')}</h2>
          <p className="text-body-2 text-secondary">{t('header.subtitle')}</p>
        </div>
        <div className="relative">
          <PermissionGate scopeKind="write_lists" fallbackText={t('cta-not-allowed')}>
            <Button onClick={handleOpen}>{t('create-button')}</Button>
          </PermissionGate>
        </div>
      </div>
      <div className="flex flex-col">
        <Table data={data?.data} errorMessage={error ? getErrorMessage(error) : undefined} isPending={isPending} />
      </div>
      <CreateDialog open={dialogOpen} onClose={handleClose} />
    </div>
  );
};

export default List;
