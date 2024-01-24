import { Breadcrumb as UIBreadcrumb, BreadcrumbItem } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useFilters from '@/entities/hooks/use-filters';
import { useEntityContext } from '@/entity/hooks/use-entity-context';

const Breadcrumb = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.breadcrumb',
  });
  const { kind, listPath } = useEntityContext();
  const { searchParams } = useFilters();
  const label = t(`${kind}.label` as ParseKeys<'common'>);
  const title = t(`${kind}.title` as ParseKeys<'common'>);
  const params = searchParams ? `?${searchParams}` : '';

  return (
    <UIBreadcrumb aria-label={t('title', { kind: label })}>
      <BreadcrumbItem href={`${listPath}${params}`} as={Link}>
        {title}
      </BreadcrumbItem>
      <BreadcrumbItem>{t('details')}</BreadcrumbItem>
    </UIBreadcrumb>
  );
};

export default Breadcrumb;
