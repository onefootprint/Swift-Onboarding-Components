import { Select, SelectOption, Text, TextInput, useToast } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import { OrganizationSize } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import type { ToolFormProps } from '../../toolbox';
import useCreateSandboxTenant from './hooks/use-create-sandbox-tenant';

type CreateSandboxTenantFormData = {
  name: string;
  domain?: string;
  superTenantId?: string | undefined;
  companySize?: SelectOption<OrganizationSize>;
};

const useCleanUpUserForm = ({ formId }: ToolFormProps) => {
  const createSandboxTenantMutation = useCreateSandboxTenant();
  const toast = useToast();
  const methods = useForm<CreateSandboxTenantFormData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = methods;
  const router = useRouter();
  const { logIn } = useSession();
  const { t } = useTranslation('common');
  const SIZE_OPTIONS = Object.values(OrganizationSize).map(size => ({
    value: size,
    label: t(`pages.onboarding.company-data.form.size.values.${size}`),
  }));

  const handleBeforeSubmit = async (data: CreateSandboxTenantFormData) => {
    const requestData = {
      name: data.name,
      domains: data.domain ? [data.domain] : [],
      superTenantId: data.superTenantId ? data.superTenantId : undefined,
      companySize: data.companySize?.value,
    };
    createSandboxTenantMutation.mutate(requestData, {
      onSuccess: async ({ token }) => {
        toast.show({
          title: 'Success',
          description: `Created tenant`,
        });
        await logIn({ auth: token, newIsLive: false });
        router.push('/settings');
      },
    });
  };

  const component = (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Text variant="label-3">
          {`Create a new tenant with the following parameters. You will be redirected to the new tenant's dashboard after creating`}
        </Text>
        <TextInput
          label="Tenant name"
          placeholder="Acme Inc."
          hasError={!!errors.name}
          {...register('name', { required: true })}
        />
        <TextInput
          label="Tenant domain"
          hint="The domain of the emails of employees of this tenant"
          placeholder="acme.org"
          hasError={!!errors.domain}
          {...register('domain', { required: false })}
        />
        <Controller
          control={control}
          name="companySize"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Select
              hasError={!!fieldState.error}
              label="Company size"
              onBlur={field.onBlur}
              onChange={field.onChange}
              options={SIZE_OPTIONS}
              value={field.value}
            />
          )}
        />
        <TextInput
          label="Parent tenant ID"
          hint="If this is a child tenant, specify the parent tenant ID"
          placeholder="org_xyz..."
          hasError={!!errors.superTenantId}
          {...register('superTenantId', { required: false })}
        />
      </StyledForm>
    </FormProvider>
  );
  return {
    component,
    isLoading: createSandboxTenantMutation.isLoading,
  };
};

export default useCleanUpUserForm;

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.spacing[5]};
  `}
`;
