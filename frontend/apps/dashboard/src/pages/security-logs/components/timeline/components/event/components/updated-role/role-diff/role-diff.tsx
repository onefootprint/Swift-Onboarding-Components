import type { AuditEventDetail, TenantScope } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import useGetRoleText from '../../role-display/components/role-permissions/hooks/use-get-role-text';
import getScopeDiff from './utils/get-scope-diff';

const RoleDiff = ({ detail }: { detail: AuditEventDetail }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.roles' });
  const getRoleText = useGetRoleText();
  if (detail.kind !== 'update_org_role') {
    return null;
  }
  const { prevScopes, newScopes } = detail.data;
  const { oldScopesRemoved, newScopesAdded, commonScopes } = getScopeDiff(prevScopes, newScopes);
  const commonScopesText = commonScopes.map(scope => getRoleText(scope as TenantScope));
  const oldScopesText = oldScopesRemoved.map(scope => getRoleText(scope as TenantScope));
  const newScopesText = newScopesAdded.map(scope => getRoleText(scope as TenantScope));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 p-4 rounded bg-secondary">
        <h3 className="text-label-3">{t('new-permissions')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {commonScopesText.map(scopeText => (
            <p key={scopeText} className="text-body-3">
              {scopeText}
            </p>
          ))}
          {newScopesText.map(scopeText => (
            <p key={scopeText} className="text-body-3 text-success">
              {scopeText} (+)
            </p>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5 rounded bg-secondary">
        <h3 className="text-label-3">{t('old-permissions')}</h3>
        <div className="grid grid-cols-2 gap-x-9 gap-y-4">
          {commonScopesText.map(scopeText => (
            <p key={scopeText} className="text-body-3">
              {scopeText}
            </p>
          ))}
          {oldScopesText.map(scopeText => (
            <p key={scopeText} className="text-body-3 text-error">
              {scopeText} (-)
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleDiff;
