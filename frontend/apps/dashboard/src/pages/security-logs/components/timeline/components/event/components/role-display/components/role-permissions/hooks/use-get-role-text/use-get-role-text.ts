import { type RoleScope, RoleScopeKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useGetRoleText = () => {
  const { t } = useTranslation('roles');

  return (scope: RoleScope) => {
    if (scope.kind === RoleScopeKind.admin) return t('scopes.admin');
    if (scope.kind === RoleScopeKind.read) return t('scopes.read');
    if (scope.kind === RoleScopeKind.onboardingConfiguration) return t('scopes.onboarding_configuration');
    if (scope.kind === RoleScopeKind.apiKeys) return t('scopes.api_keys');
    if (scope.kind === RoleScopeKind.orgSettings) return t('scopes.org_settings');
    if (scope.kind === RoleScopeKind.manualReview) return t('scopes.manual_review');
    if (scope.kind === RoleScopeKind.writeEntities) return t('scopes.write_entities');
    if (scope.kind === RoleScopeKind.invokeVaultProxy) return t('scopes.invoke_vault_proxy.checkbox');
    if (scope.kind === RoleScopeKind.decryptAll) return t('scopes.decrypt_all');
    if (scope.kind === RoleScopeKind.decryptDocuments) return t('scopes.decrypt_documents');
    if (scope.kind === RoleScopeKind.decrypt) return t('scopes.decrypt_data');
    if (scope.kind === RoleScopeKind.decryptCustom) return t('scopes.decrypt_custom');
    if (scope.kind === RoleScopeKind.cipIntegration) return t('scopes.cip_integration');
    if (scope.kind === RoleScopeKind.triggerKyc) return t('scopes.trigger_kyc');
    if (scope.kind === RoleScopeKind.triggerKyb) return t('scopes.trigger_kyb');
    if (scope.kind === RoleScopeKind.authToken) return t('scopes.auth_token');
    if (scope.kind === RoleScopeKind.manageVaultProxy) return t('scopes.manage_vault_proxy');
    if (scope.kind === RoleScopeKind.onboarding) return t('scopes.onboarding');
    if (scope.kind === RoleScopeKind.manageWebhooks) return t('scopes.manage_webhooks');
    if (scope.kind === RoleScopeKind.compliancePartnerRead) return t('scopes.compliance_partner_read');
    if (scope.kind === RoleScopeKind.compliancePartnerAdmin) return t('scopes.compliance_partner_admin');
    if (scope.kind === RoleScopeKind.compliancePartnerManageTemplates)
      return t('scopes.compliance_partner_manage_templates');
    return '';
  };
};

export default useGetRoleText;
