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

import useDecryptOptions, { DecryptOption } from './hooks/use-decrypt-options';

const Permissions = () => {
  const [animateDecryptSelect] = useAutoAnimate<HTMLDivElement>();
  const { t } = useTranslation('pages.settings.roles');
  const { register, watch, control, setValue, formState } = useFormContext();
  const { errors } = formState;
  const decryptOptions = useDecryptOptions();
  const showDecryptSelect = watch('showDecrypt');

  useEffect(() => {
    if (!showDecryptSelect) {
      setValue('decryptOptions', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDecryptSelect]);

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
          label={t('scopes.vault_proxy')}
          value={RoleScopeKind.vaultProxy}
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
          label={t('form.decrypt.label')}
          {...register('showDecrypt')}
        />
        <div ref={animateDecryptSelect}>
          {showDecryptSelect && (
            <DecryptContainer>
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
                    allOption={{
                      value: DecryptOption.all,
                      label: t('scopes.decrypt_all'),
                    }}
                    size="compact"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                    hasError={!!errors.decryptFields}
                    hint={errors.decryptFields?.message as string}
                  />
                )}
              />
            </DecryptContainer>
          )}
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

const DecryptContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[2]};
    margin-left: calc(${theme.spacing[7]} + ${theme.spacing[2]});
  `}
`;

export default Permissions;
