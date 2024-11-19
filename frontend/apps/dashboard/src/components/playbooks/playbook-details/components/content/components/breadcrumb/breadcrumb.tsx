import { Breadcrumb as UIBreadcrumb } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type BreadcrumbProps = {
  playbookName: string;
  isDisabled: boolean;
};

const Breadcrumb = ({ playbookName, isDisabled }: BreadcrumbProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'breadcrumb' });
  const { asPath } = useRouter();

  return (
    <BreadcrumbContainer data-is-disabled={isDisabled}>
      {asPath.includes('/users/') ? (
        <UIBreadcrumb.List aria-label={t('title')}>
          <UIBreadcrumb.Item href="/users" as={Link}>
            {t('users')}
          </UIBreadcrumb.Item>
          <UIBreadcrumb.Item href={asPath.replace(/\/playbook\/[^?]+/, '')} as={Link}>
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
      )}
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
