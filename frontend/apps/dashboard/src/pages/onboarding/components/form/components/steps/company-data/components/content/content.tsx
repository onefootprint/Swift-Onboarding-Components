import { type Organization, OrganizationSize } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import { Button, Select, TextInput } from '@onefootprint/ui';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useUpdateOrg from 'src/hooks/use-update-org';
import styled, { css } from 'styled-components';

export type FormData = {
  name: string;
  website: string;
  size?: SelectOption<OrganizationSize>;
};

export type ContentProps = {
  onBack: () => void;
  onComplete: () => void;
  organization: Organization;
};

const Content = ({ onBack, onComplete, organization }: ContentProps) => {
  const { t } = useTranslation('onboarding');
  const mutation = useUpdateOrg();
  const SIZE_OPTIONS = Object.values(OrganizationSize).map(size => ({
    value: size,
    label: t(`company-data.form.size.values.${size}`),
  }));
  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: organization.name,
      website: organization.websiteUrl || '',
      size: SIZE_OPTIONS.find(option => option.value === organization.companySize),
    },
  });

  const handleAfterSubmit = (formData: FormData) => {
    mutation.mutate(
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
    <Container data-testid="onboarding-company-data-content">
      <form onSubmit={handleFormSubmit(handleAfterSubmit)}>
        <TextInput
          autoFocus
          hasError={!!errors.name}
          hint={errors.name ? t('company-data.form.name.errors.required') : undefined}
          label={t('company-data.form.name.label')}
          placeholder={t('company-data.form.name.placeholder')}
          {...register('name', {
            required: {
              value: true,
              message: t('company-data.form.name.errors.required'),
            },
          })}
        />
        <TextInput
          label={t('company-data.form.website.label')}
          hasError={!!errors.website}
          hint={errors.website ? t('company-data.form.website.errors.required') : undefined}
          placeholder={t('company-data.form.website.placeholder')}
          {...register('website', {
            required: {
              value: true,
              message: t('company-data.form.website.errors.required'),
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
              hint={fieldState.error && t('company-data.form.size.errors.required')}
              label={t('company-data.form.size.label')}
              onBlur={field.onBlur}
              onChange={field.onChange}
              options={SIZE_OPTIONS}
              value={field.value}
            />
          )}
        />
        <ButtonContainer>
          <Button disabled={mutation.isPending} onClick={onBack} variant="secondary">
            {t('back')}
          </Button>
          <Button loading={mutation.isPending} type="submit">
            {t('next')}
          </Button>
        </ButtonContainer>
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

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    margin-top: ${theme.spacing[3]};
  `}
`;

export default Content;
