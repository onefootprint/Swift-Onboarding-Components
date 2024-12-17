import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

export type TenantScopeOption = {
  value: TenantScope['kind'];
  label: string;
};

type OptionGroup = {
  label: string;
  options: TenantScopeOption[];
};

const useTenantScopeOptions = () => {
  const { t } = useTranslation('roles', { keyPrefix: 'scopes' });

  const options: OptionGroup[] = [
    {
      label: 'Basic Permissions',
      options: [
        { value: 'read', label: t('read') },
        { value: 'admin', label: t('admin') },
        { value: 'api_keys', label: t('api_keys') },
        { value: 'auth_token', label: t('auth_token') },
        { value: 'org_settings', label: t('org_settings') },
        { value: 'write_entities', label: t('write_entities') },
        { value: 'onboarding', label: t('onboarding') },
        { value: 'onboarding_configuration', label: t('onboarding_configuration') },
        { value: 'manage_webhooks', label: t('manage_webhooks') },
      ],
    },
    {
      label: 'Decrypt Permissions',
      options: [
        { value: 'decrypt_all', label: t('decrypt_all') },
        { value: 'decrypt_custom', label: t('decrypt_custom') },
        { value: 'decrypt_document', label: t('decrypt_documents') },
        { value: 'decrypt_document_and_selfie', label: t('decrypt_document_and_selfie') },
      ],
    },
    {
      label: 'Compliance Permissions',
      options: [
        { value: 'manual_review', label: t('manual_review') },
        { value: 'trigger_kyc', label: t('trigger_kyc') },
        { value: 'trigger_kyb', label: t('trigger_kyb') },
        { value: 'cip_integration', label: t('cip_integration') },
      ],
    },
    {
      label: 'Proxy Permissions',
      options: [{ value: 'manage_vault_proxy', label: t('manage_vault_proxy') }],
    },
  ];

  const tenantScopeFromOption = (option: TenantScope['kind']): TenantScope => {
    return { kind: option } as TenantScope;
  };

  return {
    options,
    tenantScopeFromOption,
  };
};

export default useTenantScopeOptions;
