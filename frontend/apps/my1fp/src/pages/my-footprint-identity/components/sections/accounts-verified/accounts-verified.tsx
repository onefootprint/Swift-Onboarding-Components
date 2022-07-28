import useTranslation from 'hooks/src/use-translation/use-translation';
import React from 'react';
import { Typography } from 'ui';

// TODO: https://linear.app/footprint/issue/FP-825/implement-accounts-verified-with-footprint
const AccountsVerified = () => {
  const { t } = useTranslation('pages.my-footprint-identity.access-logs');
  return <Typography variant="body-3">{t('empty')}</Typography>;
};

export default AccountsVerified;
