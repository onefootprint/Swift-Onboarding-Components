import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RoleScope } from '@onefootprint/types';
import {
  Box,
  Checkbox,
  createFontStyles,
  MultiSelect,
  Typography,
} from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import useDecryptOptions from './hooks/use-decrypt-options';

const Permissions = () => {
  const [animateDecryptSelect] = useAutoAnimate<HTMLDivElement>();
  const { t } = useTranslation('pages.settings.roles');
  const { register, watch, control, setValue, getValues, formState } =
    useFormContext();
  const { errors } = formState;
  const decryptOptions = useDecryptOptions();
  const showDecryptSelect = watch('showDecrypt');

  useEffect(() => {
    if (!showDecryptSelect) {
      const scopes = getValues('scopes') as RoleScope[];
      const scopesWithoutDecryptFields = scopes.filter(
        scope => !scope.startsWith('decrypt'),
      );
      setValue('scopes', scopesWithoutDecryptFields);
      setValue('decryptFields', []);
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
          value="onboarding_configuration"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.api_keys')}
          value="api_keys"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.org_settings')}
          value="org_settings"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.manual_review')}
          value="manual_review"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.write_entities')}
          value="write_entities"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.vault_proxy')}
          value="vault_proxy"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.cip_integration')}
          value="cip_integration"
          {...register('scopes')}
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
                name="decryptFields"
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
                      value: RoleScope.decryptAll,
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
