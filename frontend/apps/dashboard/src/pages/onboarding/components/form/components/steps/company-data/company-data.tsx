import { useTranslation } from '@onefootprint/hooks';
import {
  Button,
  Portal,
  Select,
  SelectOption,
  TextInput,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Header from '../header';

export type CompanyDataProps = {
  id: string;
  onComplete: () => void;
};

type FormData = {
  name: string;
  website: string;
  size: SelectOption;
};

const CompanyData = ({ id, onComplete }: CompanyDataProps) => {
  const { t, allT } = useTranslation('pages.onboarding.company-data');
  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleSubmit = (formData: FormData) => {
    // TODO: FP-2016
    // https://linear.app/footprint/issue/FP-2106/dashboard-onboarding-step-3-save-data
    console.log('submit data step', formData);
    onComplete();
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Form id={id} onSubmit={handleFormSubmit(handleSubmit)}>
        <TextInput
          hasError={!!errors.name}
          hint={errors.name ? t('form.name.errors.required') : undefined}
          label={t('form.name.label')}
          placeholder={t('form.name.placeholder')}
          {...register('name', {
            required: {
              value: true,
              message: t('form.name.errors.required'),
            },
          })}
        />
        <TextInput
          label={t('form.website.label')}
          placeholder={t('form.website.placeholder')}
        />
        <Controller
          control={control}
          name="size"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Select
              hasError={!!fieldState.error}
              hint={fieldState.error && t('form.size.errors.required')}
              label={t('form.size.label')}
              onBlur={field.onBlur}
              onChange={field.onChange}
              options={[
                { value: '1-10', label: '1-10' },
                { value: '10-50', label: '10-50' },
                { value: '50-250', label: '50-250' },
                { value: '250-1000', label: '250-1000' },
                { value: '> 1000', label: '> 1000' },
              ]}
              value={field.value}
            />
          )}
        />
        <Portal selector="#onboarding-cta-portal">
          <Button form={id} size="compact" type="submit">
            {allT('next')}
          </Button>
        </Portal>
      </Form>
    </Container>
  );
};

const Container = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]} ${theme.spacing[7]} ${theme.spacing[7]};
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default CompanyData;
