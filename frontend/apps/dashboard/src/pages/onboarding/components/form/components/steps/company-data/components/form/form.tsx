import { useTranslation } from '@onefootprint/hooks';
import { Organization, OrganizationSize } from '@onefootprint/types';
import {
  Button,
  Portal,
  Select,
  SelectOption,
  TextInput,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import useUpdateOrg from 'src/hooks/use-update-org';
import styled, { css } from 'styled-components';

import SIZE_OPTIONS from './form.constants';

export type FormData = {
  name: string;
  website: string;
  size?: SelectOption<OrganizationSize>;
};

export type FormProps = {
  id: string;
  onComplete: () => void;
  organization: Organization;
};

const Form = ({ id, organization, onComplete }: FormProps) => {
  const { t, allT } = useTranslation('pages.onboarding.company-data');
  const updateOrgMutation = useUpdateOrg();
  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: organization.name,
      website: organization.websiteUrl || '',
      size: SIZE_OPTIONS.find(
        option => option.value === organization.companySize,
      ),
    },
  });

  const handleAfterSubmit = (formData: FormData) => {
    updateOrgMutation.mutate(
      {
        name: formData.name,
        websiteUrl: formData.website,
        companySize: formData.size ? formData.size.value : undefined,
      },
      {
        onSuccess: onComplete,
      },
    );
  };

  return (
    <Container data-testid="company-data-form">
      <form id={id} onSubmit={handleFormSubmit(handleAfterSubmit)}>
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
          hasError={!!errors.website}
          hint={errors.website ? t('form.website.errors.required') : undefined}
          placeholder={t('form.website.placeholder')}
          {...register('website', {
            required: {
              value: true,
              message: t('form.website.errors.required'),
            },
          })}
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
              options={SIZE_OPTIONS}
              value={field.value}
            />
          )}
        />
        <Portal selector="#onboarding-cta-portal" removeContent>
          <Button
            form={id}
            loading={updateOrgMutation.isLoading}
            size="compact"
            type="submit"
          >
            {allT('next')}
          </Button>
        </Portal>
      </form>
    </Container>
  );
};

const Container = styled.div`
  form {
    ${({ theme }) => css`
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing[7]};
    `}
  }
`;

export default Form;
