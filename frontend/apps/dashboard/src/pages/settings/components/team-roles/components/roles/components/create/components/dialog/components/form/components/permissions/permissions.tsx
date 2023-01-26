import { useTranslation } from '@onefootprint/hooks';
import { Box, Checkbox, createFontStyles, Typography } from '@onefootprint/ui';
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
