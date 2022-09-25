import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { HeaderTitle } from 'footprint-elements';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';
import { Button, TextInput } from 'ui';

import { SSN4Information } from '../../../../../../utils/state-machine/types';
import NavigationHeader from '../../../../components/navigation-header';

type FormData = SSN4Information;

type SSN4Props = {
  isMutationLoading: boolean;
  onSubmit: (formData: FormData) => void;
};

const SSN4 = ({ isMutationLoading, onSubmit }: SSN4Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('pages.onboarding.ssn.last-four');
  const { t: cta } = useTranslation('pages.onboarding.cta');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <>
      <NavigationHeader />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
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
          {cta('complete')}
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
