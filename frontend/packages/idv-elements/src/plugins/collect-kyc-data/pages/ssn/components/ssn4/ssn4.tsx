import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { HeaderTitle, NavigationHeader } from '../../../../../../components';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { SSN4Information } from '../../../../utils/data-types';

type FormData = SSN4Information;

type SSN4Props = {
  isMutationLoading: boolean;
  onSubmit: (formData: FormData) => void;
  ctaLabel?: string;
  hideHeader?: boolean;
};

const SSN4 = ({
  ctaLabel,
  isMutationLoading,
  hideHeader,
  onSubmit,
}: SSN4Props) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('pages.ssn.last-four');
  const { t: cta } = useTranslation('pages.cta');
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.ssn4]: data[UserDataAttribute.ssn4],
    },
  });

  return (
    <>
      {!hideHeader && <NavigationHeader />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        {!hideHeader && (
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        )}
        <TextInput
          data-private
          hasError={!!errors.ssn4}
          hint={errors.ssn4 && t('form.error')}
          label={t('form.label')}
          mask={inputMasks.lastFourSsn}
          placeholder={t('form.placeholder')}
          type="tel"
          value={getValues(UserDataAttribute.ssn4)}
          {...register(UserDataAttribute.ssn4, {
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
    row-gap: ${theme.spacing[7]};
  `}
`;

export default SSN4;
