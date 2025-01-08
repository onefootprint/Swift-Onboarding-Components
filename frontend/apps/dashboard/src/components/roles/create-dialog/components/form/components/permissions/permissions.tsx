import { useAutoAnimate } from '@formkit/auto-animate/react';
import { possibleTenantScopes, supportedTenantRoleKinds } from '@onefootprint/core';
import type { TenantRoleKindDiscriminant, TenantScope } from '@onefootprint/request-types/dashboard';
import { Checkbox, MultiSelect } from '@onefootprint/ui';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDecryptOptions, useVaultProxyOptions } from 'src/components/roles';

export type PermissionsProps = {
  kind: TenantRoleKindDiscriminant;
};

const Permissions = ({ kind }: PermissionsProps) => {
  const [animateDecryptSelect] = useAutoAnimate<HTMLDivElement>();
  const [animateProxyConfigSelect] = useAutoAnimate<HTMLDivElement>();
  const { t } = useTranslation('roles');
  const { register, watch, control, setValue, formState } = useFormContext();
  const { errors } = formState;
  const { options: decryptOptions, allOption: decryptAllOption } = useDecryptOptions();
  const { options: proxyOptions, allOption: proxyAllOption } = useVaultProxyOptions();
  const showDecryptSelect = watch('showDecrypt');
  const showProxySelect = watch('showProxyConfigs');

  useEffect(() => {
    if (!showDecryptSelect) {
      setValue('decryptOptions', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDecryptSelect]);
  useEffect(() => {
    if (!showProxySelect) {
      setValue('vaultProxyConfigs', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProxySelect]);

  // Here we determine, based on a role kind, which scopes are supported
  // We will only show the user the scopes that would be possible for a given role kind
  const supportedScopeKinds = possibleTenantScopes.filter(s => {
    if (!kind) {
      // legacy roles support all types
      return true;
    }
    return supportedTenantRoleKinds[s].includes(kind);
  });

  return (
    <>
      <div className="mb-4">
        <h2 className="text-label-2 text-primary">{t('form.permissions.title')}</h2>
      </div>
      <div className="flex flex-col gap-3">
        {supportedScopeKinds.includes('read') && (
          <Checkbox disabled label={t('scopes.read')} hint={t('scopes.hints.read')} checked />
        )}
        {supportedScopeKinds.includes('onboarding_configuration') && (
          <Checkbox
            label={t('scopes.onboarding_configuration')}
            hint={t('scopes.hints.playbooks')}
            value={'onboarding_configuration' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('decrypt') && (
          <div>
            <Checkbox label={t('form.decrypt.label')} hint={t('scopes.hints.decrypt')} {...register('showDecrypt')} />
            <div ref={animateDecryptSelect}>
              {showDecryptSelect && (
                <div className="mt-3 ml-7">
                  <Controller
                    control={control}
                    name="decryptOptions"
                    rules={{
                      required: {
                        value: true,
                        message: t('form.decrypt.errors.required'),
                      },
                    }}
                    render={({ field }) => (
                      <MultiSelect
                        label={t('form.decrypt-attributes.label')}
                        options={decryptOptions}
                        allOption={decryptAllOption}
                        size="compact"
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value}
                        hasError={!!errors.decryptFields}
                        hint={errors.decryptFields?.message as string}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {supportedScopeKinds.includes('api_keys') && (
          <Checkbox
            label={t('scopes.api_keys')}
            hint={t('scopes.hints.api_keys')}
            value={'api_keys' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}

        {supportedScopeKinds.includes('org_settings') && (
          <Checkbox
            label={t('scopes.org_settings')}
            hint={t('scopes.hints.org_settings')}
            value={'org_settings' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('manual_review') && (
          <Checkbox
            label={t('scopes.manual_review')}
            hint={t('scopes.hints.manual_review')}
            value={'manual_review' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('write_entities') && (
          <Checkbox
            label={t('scopes.write_entities')}
            hint={t('scopes.hints.write_entities')}
            value={'write_entities' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('cip_integration') && (
          <Checkbox
            label={t('scopes.cip_integration')}
            hint={t('scopes.hints.cip_integration')}
            value={'cip_integration' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('trigger_kyc') && (
          <Checkbox
            label={t('scopes.trigger_kyc')}
            hint={t('scopes.hints.trigger_kyc')}
            value={'trigger_kyc' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('trigger_kyb') && (
          <Checkbox
            label={t('scopes.trigger_kyb')}
            hint={t('scopes.hints.trigger_kyb')}
            value={'trigger_kyb' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('auth_token') && (
          <Checkbox
            label={t('scopes.auth_token')}
            hint={t('scopes.hints.auth_token')}
            value={'auth_token' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('onboarding') && (
          <Checkbox
            label={t('scopes.onboarding')}
            hint={t('scopes.hints.onboarding')}
            value={'onboarding' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('manage_webhooks') && (
          <Checkbox
            label={t('scopes.manage_webhooks')}
            hint={t('scopes.hints.manage_webhooks')}
            value={'manage_webhooks' as TenantScope['kind']}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes('manage_vault_proxy') && (
          <Checkbox
            label={t('scopes.manage_vault_proxy')}
            hint={t('scopes.hints.manage_vault_proxy')}
            value={'manage_vault_proxy' as TenantScope['kind']}
            {...register('scopes')}
          />
        )}
        {supportedScopeKinds.includes('invoke_vault_proxy') && (
          <div>
            <Checkbox
              label={t('scopes.invoke_vault_proxy.checkbox')}
              hint={t('scopes.hints.invoke_vault_proxy')}
              {...register('showProxyConfigs')}
            />
            <div ref={animateProxyConfigSelect}>
              {showProxySelect && (
                <div className="mt-3 ml-7">
                  <Controller
                    control={control}
                    name="vaultProxyConfigs"
                    rules={{
                      required: {
                        value: true,
                        message: t('form.proxy-configs.errors.required'),
                      },
                    }}
                    render={({ field }) => (
                      <MultiSelect
                        label={t('form.proxy-configs.label')}
                        options={proxyOptions}
                        allOption={proxyAllOption}
                        size="compact"
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value}
                        hasError={!!errors.vaultProxyConfigs}
                        hint={errors.vaultProxyConfigs?.message as string}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Permissions;
