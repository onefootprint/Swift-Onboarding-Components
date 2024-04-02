import { Breadcrumb as UIBreadcrumb } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type BreadcrumbProps = {
  playbookName: string;
};

const Breadcrumb = ({ playbookName }: BreadcrumbProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.breadcrumb',
  });
  const { asPath } = useRouter();

  return asPath.includes('/users/') ? (
    <UIBreadcrumb.List aria-label={t('title')}>
      <UIBreadcrumb.Item href="/users" as={Link}>
        {t('users')}
      </UIBreadcrumb.Item>
      <UIBreadcrumb.Item
        href={asPath.replace(/\/playbook\/[^?]+/, '')}
        as={Link}
      >
        {t('user-details')}
      </UIBreadcrumb.Item>
      <UIBreadcrumb.Item>{t('playbook-details')}</UIBreadcrumb.Item>
    </UIBreadcrumb.List>
  ) : (
    <UIBreadcrumb.List aria-label={t('title')}>
      <UIBreadcrumb.Item href="/playbooks" as={Link}>
        {t('playbooks')}
      </UIBreadcrumb.Item>
      <UIBreadcrumb.Item>{playbookName}</UIBreadcrumb.Item>
    </UIBreadcrumb.List>
  );
};

export default Breadcrumb;
