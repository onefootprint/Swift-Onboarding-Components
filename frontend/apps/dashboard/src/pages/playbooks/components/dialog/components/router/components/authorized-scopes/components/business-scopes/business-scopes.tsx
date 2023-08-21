import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Checkbox, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const BusinessScopes = () => {
  const { register } = useFormContext();
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection.authorized-scopes',
  );

  return (
    <Container>
      <Checkbox
        label={t('all-business-info')}
        {...register(`authorized-allKybData`)}
      />
      <Divider />
      <Typography variant="label-3">{t('beneficial-owner')}</Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `};
`;

export default BusinessScopes;
