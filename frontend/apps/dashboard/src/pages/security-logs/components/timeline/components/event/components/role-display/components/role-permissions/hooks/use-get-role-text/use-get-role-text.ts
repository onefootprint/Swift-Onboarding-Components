import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useGetRoleText = () => {
  const { t } = useTranslation('roles');

  return (scope: TenantScope) => {
    if (scope.kind === 'admin') return t('scopes.admin');
    if (scope.kind === 'read') return t('scopes.read');
    if (scope.kind === 'onboarding_configuration') return t('scopes.onboarding_configuration');
    if (scope.kind === 'api_keys') return t('scopes.api_keys');
    if (scope.kind === 'org_settings') return t('scopes.org_settings');
    if (scope.kind === 'manual_review') return t('scopes.manual_review');
    if (scope.kind === 'write_entities') return t('scopes.write_entities');
    if (scope.kind === 'invoke_vault_proxy') return t('scopes.invoke_vault_proxy.checkbox');
    if (scope.kind === 'decrypt_all') return t('scopes.decrypt_all');
    if (scope.kind === 'decrypt_document') return t('scopes.decrypt_document');
    if (scope.kind === 'decrypt') return t('scopes.decrypt_data');
    if (scope.kind === 'decrypt_custom') return t('scopes.decrypt_custom');
    if (scope.kind === 'cip_integration') return t('scopes.cip_integration');
    if (scope.kind === 'trigger_kyc') return t('scopes.trigger_kyc');
    if (scope.kind === 'trigger_kyb') return t('scopes.trigger_kyb');
    if (scope.kind === 'auth_token') return t('scopes.auth_token');
    if (scope.kind === 'manage_vault_proxy') return t('scopes.manage_vault_proxy');
    if (scope.kind === 'onboarding') return t('scopes.onboarding');
    if (scope.kind === 'manage_webhooks') return t('scopes.manage_webhooks');
    if (scope.kind === 'compliance_partner_read') return t('scopes.compliance_partner_read');
    if (scope.kind === 'compliance_partner_admin') return t('scopes.compliance_partner_admin');
    if (scope.kind === 'compliance_partner_manage_templates') return t('scopes.compliance_partner_manage_templates');
    return '';
  };
};

export default useGetRoleText;
