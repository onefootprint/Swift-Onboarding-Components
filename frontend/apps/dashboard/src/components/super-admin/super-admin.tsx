import { Dialog } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useRouter from 'src/hooks/use-router';
import useUserSession from 'src/hooks/use-user-session';

import TenantsList from './components/tenants-list';

const SuperAdmin = () => {
  const { t } = useTranslation('super-admin');
  const user = useUserSession();
  const router = useRouter();
  const isOpen = router.query.admin === 'true';
  const isFirmEmployee = user.data?.isFirmEmployee;

  const handleClose = () => {
    router.resetQuery();
  };

  return (
    <Dialog
      onClose={handleClose}
      open={isFirmEmployee && isOpen}
      size="full-screen"
      title={t('page-title')}
    >
      <TenantsList />
    </Dialog>
  );
};

export default SuperAdmin;
