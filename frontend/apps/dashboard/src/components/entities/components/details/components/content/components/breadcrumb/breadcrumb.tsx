import { Breadcrumb as UIBreadcrumb } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useFilters from '@/entities/hooks/use-filters';
import { useEntityContext } from '@/entity/hooks/use-entity-context';

type BreadcrumbProps = {
  isDisabled?: boolean;
};

const Breadcrumb = ({ isDisabled }: BreadcrumbProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.breadcrumb',
  });
  const { kind, listPath } = useEntityContext();
  const { searchParams } = useFilters();
  const label = t(`${kind}.label` as ParseKeys<'common'>);
  const title = t(`${kind}.title` as ParseKeys<'common'>);
  const params = searchParams ? `?${searchParams}` : '';

  return (
    <BreadcrumbContainer data-is-disabled={isDisabled}>
      <UIBreadcrumb.List aria-label={t('title', { kind: label })}>
        <UIBreadcrumb.Item href={`${listPath}${params}`} as={Link}>
          {title}
        </UIBreadcrumb.Item>
        <UIBreadcrumb.Item>{t('details')}</UIBreadcrumb.Item>
      </UIBreadcrumb.List>
    </BreadcrumbContainer>
  );
};

const BreadcrumbContainer = styled.span`
  &[data-is-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }
`;

export default Breadcrumb;
