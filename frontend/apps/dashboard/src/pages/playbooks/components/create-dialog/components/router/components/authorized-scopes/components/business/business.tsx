import { Checkbox, Divider, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const Business = () => {
  const { register } = useFormContext();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.authorized-scopes',
  });

  return (
    <Container>
      <Checkbox
        label={t('all-business-info')}
        {...register(`allBusinessData`)}
      />
      <Divider />
      <Text variant="label-2">{t('beneficial-owners')}</Text>
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

export default Business;
