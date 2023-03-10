import { useTranslation } from '@onefootprint/hooks';
import { BusinessData, BusinessDataAttribute } from '@onefootprint/types';
import { Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { BasicData } from '../../../../utils/state-machine/types';

type FormData = BasicData;

export type BasicDataFormProps = {
  defaultValues?: Pick<
    BusinessData,
    BusinessDataAttribute.name | BusinessDataAttribute.ein
  >;
  isLoading: boolean;
  onSubmit: (data: BasicData) => void;
  ctaLabel?: string;
};

const BasicDataForm = ({
  defaultValues,
  isLoading,
  onSubmit,
  ctaLabel,
}: BasicDataFormProps) => {
  const { allT, t } = useTranslation('pages.basic-data.form');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicData = {
      [BusinessDataAttribute.name]: formData[BusinessDataAttribute.name],
      [BusinessDataAttribute.ein]: formData[BusinessDataAttribute.ein],
    };
    onSubmit(basicData);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitFormData)}>
      <TextInput
        data-private
        hasError={!!errors[BusinessDataAttribute.name]}
        hint={
          errors[BusinessDataAttribute.name]
            ? t('business-name.error')
            : undefined
        }
        label={t('business-name.label')}
        placeholder={t('business-name.placeholder')}
        {...register(BusinessDataAttribute.name, { required: true })}
      />
      <TextInput
        type="number"
        data-private
        hasError={!!errors[BusinessDataAttribute.ein]}
        hint={errors[BusinessDataAttribute.ein] ? t('ein.error') : undefined}
        label={t('ein.label')}
        placeholder={t('ein.placeholder')}
        {...register(BusinessDataAttribute.ein, { required: true })}
      />
      <Button type="submit" fullWidth loading={isLoading}>
        {ctaLabel ?? allT('pages.cta-continue')}
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default BasicDataForm;
