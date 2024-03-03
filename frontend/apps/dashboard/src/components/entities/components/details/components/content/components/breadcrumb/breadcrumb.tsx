import { Breadcrumb as UIBreadcrumb } from '@onefootprint/ui';
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
    <UIBreadcrumb.List aria-label={t('title', { kind: label })}>
      <UIBreadcrumb.Item href={`${listPath}${params}`} as={Link}>
        {title}
      </UIBreadcrumb.Item>
      <UIBreadcrumb.Item>{t('details')}</UIBreadcrumb.Item>
    </UIBreadcrumb.List>
  );
};

export default Breadcrumb;
