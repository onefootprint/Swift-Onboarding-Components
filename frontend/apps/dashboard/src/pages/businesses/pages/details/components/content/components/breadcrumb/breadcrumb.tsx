import { useTranslation } from '@onefootprint/hooks';
import { Breadcrumb as UIBreadcrumb, BreadcrumbItem } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

const Breadcrumb = () => {
  const { t } = useTranslation('pages.business');

  return (
    <UIBreadcrumb aria-label={t('breadcrumb.title')}>
      <BreadcrumbItem href="/businesses" as={Link}>
        {t('breadcrumb.list')}
      </BreadcrumbItem>
      <BreadcrumbItem>{t('breadcrumb.details')}</BreadcrumbItem>
    </UIBreadcrumb>
  );
};

export default Breadcrumb;
