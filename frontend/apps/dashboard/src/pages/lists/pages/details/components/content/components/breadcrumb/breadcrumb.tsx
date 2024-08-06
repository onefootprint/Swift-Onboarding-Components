import { Breadcrumb as UIBreadcrumb } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const Breadcrumb = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.breadcrumb',
  });

  return (
    <UIBreadcrumb.List aria-label={t('title')}>
      <UIBreadcrumb.Item href="/lists" as={Link}>
        {t('title')}
      </UIBreadcrumb.Item>
      <UIBreadcrumb.Item>{t('details')}</UIBreadcrumb.Item>
    </UIBreadcrumb.List>
  );
};

export default Breadcrumb;
