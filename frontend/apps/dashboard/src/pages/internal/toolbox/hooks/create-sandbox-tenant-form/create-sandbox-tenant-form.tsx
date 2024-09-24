import { Form, Select, type SelectOption, Text, useToast } from '@onefootprint/ui';
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
  const { t } = useTranslation('onboarding');
  const SIZE_OPTIONS = Object.values(OrganizationSize).map(size => ({
    value: size,
    label: t(`company-data.form.size.values.${size}`),
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
          description: 'Created tenant',
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
        <Form.Field>
          <Form.Label>Tenant name</Form.Label>
          <Form.Input placeholder="Acme Inc." hasError={!!errors.name} {...register('name', { required: true })} />
        </Form.Field>
        <Form.Field>
          <Form.Label>Tenant domain</Form.Label>
          <Form.Input placeholder="acme.org" hasError={!!errors.domain} {...register('domain', { required: false })} />
          <Form.Hint>The domain of the emails of employees of this tenant</Form.Hint>
        </Form.Field>
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
        <Form.Field>
          <Form.Label>Parent tenant ID</Form.Label>
          <Form.Input
            placeholder="org_xyz..."
            hasError={!!errors.superTenantId}
            {...register('superTenantId', { required: false })}
          />
          <Form.Hint>If this is a child tenant, specify the parent tenant ID</Form.Hint>
        </Form.Field>
      </StyledForm>
    </FormProvider>
  );
  return {
    component,
    isPending: createSandboxTenantMutation.isPending,
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
