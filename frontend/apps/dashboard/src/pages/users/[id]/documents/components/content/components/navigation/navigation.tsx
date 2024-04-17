import { Breadcrumb } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t } = useTranslation('user-details', { keyPrefix: 'navigation' });

  return (
    <Breadcrumb.List aria-label={t('title')}>
      <Breadcrumb.Item href="/users" as={Link}>
        {t('users')}
      </Breadcrumb.Item>
      <Breadcrumb.Item href="/users" as={Link}>
        {t('user-details')}
      </Breadcrumb.Item>
      <Breadcrumb.Item>{t('documents')}</Breadcrumb.Item>
    </Breadcrumb.List>
  );
};

export default Navigation;
