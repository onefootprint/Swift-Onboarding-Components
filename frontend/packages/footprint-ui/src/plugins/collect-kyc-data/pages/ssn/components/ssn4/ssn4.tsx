import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import { SSN4Information } from '../../../../utils/state-machine/types';

type FormData = SSN4Information;

type SSN4Props = {
  isMutationLoading: boolean;
  onSubmit: (formData: FormData) => void;
  ctaLabel?: string;
  hideTitle?: boolean;
  hideNavHeader?: boolean;
};

const SSN4 = ({
  ctaLabel,
  isMutationLoading,
  hideTitle,
  hideNavHeader,
  onSubmit,
}: SSN4Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('pages.ssn.last-four');
  const { t: cta } = useTranslation('pages.cta');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <>
      {!hideNavHeader && <NavigationHeader />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        {!hideTitle && (
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        )}
        <TextInput
          hasError={!!errors.ssn4}
          hint={errors.ssn4 && t('form.error')}
          label={t('form.label')}
          mask={inputMasks.lastFourSsn}
          placeholder={t('form.placeholder')}
          type="tel"
          {...register('ssn4', {
            required: true,
            // 0000 is not allowed, has to be 4 digits long
            pattern: /^((?!(0000))\d{4})$/,
          })}
        />
        <Button type="submit" fullWidth loading={isMutationLoading}>
          {ctaLabel ?? cta('continue')}
        </Button>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default SSN4;
