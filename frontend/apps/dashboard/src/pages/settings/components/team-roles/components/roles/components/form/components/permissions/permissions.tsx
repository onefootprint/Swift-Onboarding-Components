import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RoleScopeKind } from '@onefootprint/types';
import {
  Box,
  Checkbox,
  createFontStyles,
  MultiSelect,
  Typography,
} from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import useDecryptOptions from '../../../../../../hooks/use-decrypt-options';
import useVaultProxyOptions from '../../../../../../hooks/use-vault-proxy-options';

const Permissions = () => {
  const [animateDecryptSelect] = useAutoAnimate<HTMLDivElement>();
  const [animateProxyConfigSelect] = useAutoAnimate<HTMLDivElement>();
  const { t } = useTranslation('pages.settings.roles');
  const { register, watch, control, setValue, formState } = useFormContext();
  const { errors } = formState;
  const { options: decryptOptions, allOption: decryptAllOption } =
    useDecryptOptions();
  const { options: proxyOptions, allOption: proxyAllOption } =
    useVaultProxyOptions();
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

  return (
    <>
      <Box sx={{ marginBottom: 5 }}>
        <Typography variant="label-2">{t('form.permissions.title')}</Typography>
      </Box>
      <ToggleContainer>
        <Checkbox disabled label={t('scopes.read')} checked />
        <Checkbox
          label={t('scopes.onboarding_configuration')}
          value={RoleScopeKind.onboardingConfiguration}
          {...register('scopeKinds')}
        />
        <Checkbox
          label={t('scopes.api_keys')}
          value={RoleScopeKind.apiKeys}
          {...register('scopeKinds')}
        />
        <Checkbox
          label={t('scopes.org_settings')}
          value={RoleScopeKind.orgSettings}
          {...register('scopeKinds')}
        />
        <Checkbox
          label={t('scopes.manual_review')}
          value={RoleScopeKind.manualReview}
          {...register('scopeKinds')}
        />
        <Checkbox
          label={t('scopes.write_entities')}
          value={RoleScopeKind.writeEntities}
          {...register('scopeKinds')}
        />
        <Checkbox
          label={t('scopes.cip_integration')}
          value={RoleScopeKind.cipIntegration}
          {...register('scopeKinds')}
        />
        <Checkbox
          label={t('scopes.trigger_kyc')}
          value={RoleScopeKind.triggerKyc}
          {...register('scopeKinds')}
        />
        <Checkbox
          label={t('scopes.manage_vault_proxy')}
          value={RoleScopeKind.manageVaultProxy}
          {...register('scopes')}
        />
        <div>
          <Checkbox
            label={t('scopes.invoke_vault_proxy.checkbox')}
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
        <div>
          <Checkbox
            label={t('form.decrypt.label')}
            {...register('showDecrypt')}
          />
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
