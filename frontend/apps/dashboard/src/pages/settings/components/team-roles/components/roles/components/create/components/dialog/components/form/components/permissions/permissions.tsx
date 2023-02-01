import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import {
  Box,
  Checkbox,
  createFontStyles,
  MultiSelect,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useDecryptOptions from './hooks/use-decrypt-options';

const Permissions = () => {
  const [animateDecryptSelect] = useAutoAnimate<HTMLDivElement>();
  const { t } = useTranslation('pages.settings.roles.create.form.permissions');
  const { register, watch, control } = useFormContext();
  const decryptOptions = useDecryptOptions();
  const showDecryptSelect = watch('showDecrypt');

  return (
    <>
      <Box sx={{ marginBottom: 5 }}>
        <Typography variant="label-2">{t('label')}</Typography>
      </Box>
      <ToggleContainer>
        <Checkbox disabled label={t('scopes.read')} checked />
        <Checkbox
          label={t('scopes.onboarding-configuration')}
          value="onboarding_configuration"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.api-keys')}
          value="api_keys"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.org-settings')}
          value="org_settings"
          {...register('scopes')}
        />
        <Checkbox
          label={t('scopes.manual-review')}
          value="manual_review"
          {...register('scopes')}
        />
        <Checkbox label={t('scopes.decrypt')} {...register('showDecrypt')} />
        <div ref={animateDecryptSelect}>
          {showDecryptSelect && (
            <DecryptContainer>
              <Controller
                control={control}
                name="decryptFields"
                rules={{ required: true }}
                render={({ field }) => (
                  <MultiSelect
                    label={t('scopes.decrypt-attributes')}
                    options={decryptOptions}
                    size="compact"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
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
