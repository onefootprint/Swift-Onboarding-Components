import type { Organization } from '@onefootprint/request-types/dashboard';
import { Avatar } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import { cx } from 'class-variance-authority';
import usePermissions from 'src/hooks/use-permissions';
import useUpdateOrgLogo from './hooks/use-update-org-logo';

type LogoProps = {
  organization: Organization;
};

const Logo = ({ organization }: LogoProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.business-profile.logo' });
  const updateOrgLogoMutation = useUpdateOrgLogo();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('org_settings');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }
    const form = new FormData();
    form.set('file', files[0]);
    updateOrgLogoMutation.mutate({ body: form });
  };

  return (
    <div className="flex gap-4">
      <Avatar name={organization.name} size="xlarge" src={organization.logoUrl} />
      <div className="flex items-center justify-center">
        <PermissionGate scopeKind="org_settings" fallbackText={t('not-allowed')}>
          <label
            className={cx('cursor-pointer text-accent text-label-3', {
              'pointer-events-none opacity-50': !canEdit,
            })}
          >
            {t('cta')}
            <input
              type="file"
              accept="image/svg+xml, image/png, image/jpeg"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </PermissionGate>
      </div>
    </div>
  );
};

export default Logo;
