import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { RoleKind } from '@onefootprint/types';
import { RoleScopeKind, supportedRoleKinds } from '@onefootprint/types';
import { Box, Checkbox, MultiSelect, Text, createFontStyles } from '@onefootprint/ui';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDecryptOptions, useVaultProxyOptions } from 'src/components/roles';
import styled, { css } from 'styled-components';

export type PermissionsProps = {
  kind: RoleKind;
};

const Permissions = ({ kind }: PermissionsProps) => {
  const [animateDecryptSelect] = useAutoAnimate<HTMLDivElement>();
  const [animateProxyConfigSelect] = useAutoAnimate<HTMLDivElement>();
  const { t } = useTranslation('common', { keyPrefix: 'pages.settings.roles' });
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

  const supportedScopeKinds = Object.values(RoleScopeKind).filter(s => {
    // For legacy roles, all scopes are supported
    if (!kind) {
      return true;
    }

    return supportedRoleKinds[s].includes(kind);
  });

  return (
    <>
      <Box marginBottom={5}>
        <Text variant="label-2">{t('form.permissions.title')}</Text>
      </Box>
      <ToggleContainer>
        {supportedScopeKinds.includes(RoleScopeKind.read) && (
          <Checkbox disabled label={t('scopes.read')} hint={t('scopes.hints.read')} checked />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.onboardingConfiguration) && (
          <Checkbox
            label={t('scopes.onboarding_configuration')}
            hint={t('scopes.hints.playbooks')}
            value={RoleScopeKind.onboardingConfiguration}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.apiKeys) && (
          <Checkbox
            label={t('scopes.api_keys')}
            hint={t('scopes.hints.api_keys')}
            value={RoleScopeKind.apiKeys}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.orgSettings) && (
          <Checkbox
            label={t('scopes.org_settings')}
            hint={t('scopes.hints.org_settings')}
            value={RoleScopeKind.orgSettings}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.manualReview) && (
          <Checkbox
            label={t('scopes.manual_review')}
            hint={t('scopes.hints.manual_review')}
            value={RoleScopeKind.manualReview}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.writeEntities) && (
          <Checkbox
            label={t('scopes.write_entities')}
            hint={t('scopes.hints.write_entities')}
            value={RoleScopeKind.writeEntities}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.cipIntegration) && (
          <Checkbox
            label={t('scopes.cip_integration')}
            hint={t('scopes.hints.cip_integration')}
            value={RoleScopeKind.cipIntegration}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.triggerKyc) && (
          <Checkbox
            label={t('scopes.trigger_kyc')}
            hint={t('scopes.hints.trigger_kyc')}
            value={RoleScopeKind.triggerKyc}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.triggerKyb) && (
          <Checkbox
            label={t('scopes.trigger_kyb')}
            hint={t('scopes.hints.trigger_kyb')}
            value={RoleScopeKind.triggerKyb}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.authToken) && (
          <Checkbox
            label={t('scopes.auth_token')}
            hint={t('scopes.hints.auth_token')}
            value={RoleScopeKind.authToken}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.onboarding) && (
          <Checkbox
            label={t('scopes.onboarding')}
            hint={t('scopes.hints.onboarding')}
            value={RoleScopeKind.onboarding}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.manageWebhooks) && (
          <Checkbox
            label={t('scopes.manage_webhooks')}
            hint={t('scopes.hints.manage_webhooks')}
            value={RoleScopeKind.manageWebhooks}
            {...register('scopeKinds')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.manageVaultProxy) && (
          <Checkbox
            label={t('scopes.manage_vault_proxy')}
            hint={t('scopes.hints.manage_vault_proxy')}
            value={RoleScopeKind.manageVaultProxy}
            {...register('scopes')}
          />
        )}
        {supportedScopeKinds.includes(RoleScopeKind.invokeVaultProxy) && (
          <div>
            <Checkbox
              label={t('scopes.invoke_vault_proxy.checkbox')}
              hint={t('scopes.hints.invoke_vault_proxy')}
              {...register('showProxyConfigs')}
            />
            <div ref={animateProxyConfigSelect}>
              {showProxySelect && (
                <MultiSelectContainer>
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
                </MultiSelectContainer>
              )}
            </div>
          </div>
        )}
        {supportedScopeKinds.includes(RoleScopeKind.decrypt) && (
          <div>
            <Checkbox label={t('form.decrypt.label')} hint={t('scopes.hints.decrypt')} {...register('showDecrypt')} />
            <div ref={animateDecryptSelect}>
              {showDecryptSelect && (
                <MultiSelectContainer>
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
                </MultiSelectContainer>
              )}
            </div>
          </div>
        )}
      </ToggleContainer>
    </>
  );
};

const ToggleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};

    label {
      ${createFontStyles('body-3')};
    }
  `}
`;

const MultiSelectContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[4]};
    margin-left: calc(${theme.spacing[7]} + ${theme.spacing[2]});
  `}
`;

export default Permissions;
