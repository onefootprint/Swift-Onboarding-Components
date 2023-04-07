import { useTranslation } from '@onefootprint/hooks';
import { Breadcrumb as UIBreadcrumb, BreadcrumbItem } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

import useFilters from '@/entities/hooks/use-filters';
import { useEntityContext } from '@/entity/hooks/use-entity-context';

const Breadcrumb = () => {
  const { t } = useTranslation('pages.entity.breadcrumb');
  const { kind, listPath } = useEntityContext();
  const { searchParams } = useFilters();
  const label = t(`${kind}.label`);
  const title = t(`${kind}.title`);
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
