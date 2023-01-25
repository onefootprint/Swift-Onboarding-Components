import { useTranslation } from '@onefootprint/hooks';
import { Box, createFontStyles, Toggle, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

const Permissions = () => {
  const { t } = useTranslation('pages.settings.roles.create.form.permissions');
  const { register } = useFormContext();

  return (
    <>
      <Box sx={{ marginBottom: 5 }}>
        <Typography variant="label-2">{t('label')}</Typography>
      </Box>
      <ToggleContainer>
        <Toggle
          fullWidth
          label={t('scopes.read')}
          checked
          disabled
          {...register('read')}
        />
        <Toggle
          fullWidth
          label={t('scopes.onboarding-configuration')}
          {...register('onboarding_configuration')}
        />
        <Toggle
          fullWidth
          label={t('scopes.api-keys')}
          {...register('api_keys')}
        />
        <Toggle
          fullWidth
          label={t('scopes.org-settings')}
          {...register('org_settings')}
        />
        <Toggle
          fullWidth
          label={t('scopes.manual-review')}
          {...register('manual_review')}
        />
        <Toggle
          fullWidth
          label={t('scopes.decrypt')}
          {...register('decrypt')}
        />
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

export default Permissions;
