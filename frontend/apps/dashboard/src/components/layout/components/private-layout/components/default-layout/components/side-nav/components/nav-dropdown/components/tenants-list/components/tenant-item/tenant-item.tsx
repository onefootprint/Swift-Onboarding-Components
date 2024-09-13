import type { GetAuthRolesOrg } from '@onefootprint/types';
import { Dropdown, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type TenantItemProps = {
  tenant: GetAuthRolesOrg;
  children: string;
  onClick: () => void;
};

const TenantItem = ({ tenant, children, onClick }: TenantItemProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav.tenants-list',
  });

  return (
    tenant.isAuthMethodSupported && (
      <Dropdown.RadioItem
        data-testid="tenant-item"
        aria-label={t('log-in-to', { tenantName: tenant.name })}
        value={tenant.id}
        onSelect={onClick}
      >
        <Text variant="body-3" truncate>
          {children}
        </Text>
      </Dropdown.RadioItem>
    )
  );
};

export default TenantItem;
