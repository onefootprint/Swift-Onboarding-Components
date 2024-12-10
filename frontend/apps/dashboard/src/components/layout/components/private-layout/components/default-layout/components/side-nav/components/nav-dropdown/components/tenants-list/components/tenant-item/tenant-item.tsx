import { IcoCheckSmall16 } from '@onefootprint/icons';
import type { GetAuthRolesOrg } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
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
        <p className="truncate body-3">{children}</p>
        <Dropdown.ItemIndicator>
          <IcoCheckSmall16 />
        </Dropdown.ItemIndicator>
      </Dropdown.RadioItem>
    )
  );
};

export default TenantItem;
