import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { Divider } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useGetRoleText from '../../../role-display/components/role-permissions/hooks/use-get-role-text';

const ApiKeyDetails = ({ name, scopes, roleName }: { name: string; scopes: TenantScope[]; roleName: string }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.api-keys' });
  const getRoleText = useGetRoleText();
  const roleText = scopes.map(scope => getRoleText(scope as TenantScope));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-x-9 gap-y-4">
        <div className="flex flex-col gap-2 min-w-[140px]">
          <span className="text-body-3 text-tertiary">{t('name')}</span>
          <span className="text-body-3">{name}</span>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          <span className="text-body-3 text-tertiary">{t('role')}</span>
          <span className="text-body-3">{roleName}</span>
        </div>
      </div>
      <Divider variant="secondary" />
      <div className="flex flex-col gap-4 px-4 py-3 rounded bg-secondary">
        <h3 className="text-label-3">{t('permissions')}</h3>
        <div className={`grid ${roleText.length > 2 ? 'grid-cols-2' : 'grid-cols-1'} justify-between gap-x-9 gap-y-3`}>
          {roleText.map(text => (
            <div key={text}>
              <span className="text-body-3 whitespace-nowrap">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyDetails;
