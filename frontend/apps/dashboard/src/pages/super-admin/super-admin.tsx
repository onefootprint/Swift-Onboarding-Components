import { Dialog } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useUserSession from 'src/hooks/use-user-session';

import TenantsList from './components/tenants-list';

const SuperAdmin = () => {
  const { t } = useTranslation('super-admin');
  const user = useUserSession();
  const router = useRouter();
  const isFirmEmployee = user.data?.isFirmEmployee;

  const handleClose = () => {
    router.push('/');
  };

  return (
    <Dialog
      onClose={handleClose}
      open={isFirmEmployee}
      size="full-screen"
      title={t('page-title')}
    >
      <TenantsList />
    </Dialog>
  );
};

export default SuperAdmin;
