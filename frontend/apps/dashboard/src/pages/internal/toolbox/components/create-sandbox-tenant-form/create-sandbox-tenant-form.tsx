import styled, { css } from '@onefootprint/styled';
import { TextInput, Typography, useToast } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

import useCreateSandboxTenant from './hooks/use-create-sandbox-tenant';

type CreateSandboxTenantFormData = {
  name: string;
  domain: string;
};

type RetriggerKYCFormProps = {
  formId: string;
  onClose: () => void;
};

const CleanUpUserForm = ({ formId }: RetriggerKYCFormProps) => {
  const createSandboxTenantMutation = useCreateSandboxTenant();
  const toast = useToast();
  const methods = useForm<CreateSandboxTenantFormData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
  const router = useRouter();
  const { refreshUserPermissions, setIsLive } = useSession();

  const handleBeforeSubmit = async (data: CreateSandboxTenantFormData) => {
    const requestData = {
      name: data.name,
      domains: [data.domain],
    };
    createSandboxTenantMutation.mutate(requestData, {
      onSuccess: async () => {
        toast.show({
          title: 'Success',
          description: `Created tenant`,
        });
        await setIsLive(false);
        await refreshUserPermissions({});
        router.push('/settings');
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Typography variant="label-3">
          {`Create a new tenant with the following parameters. You will be redirected to the new tenant's dashboard after creating`}
        </Typography>
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
          {...register('domain', { required: true })}
        />
      </StyledForm>
    </FormProvider>
  );
};

export default CleanUpUserForm;

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.spacing[5]};
  `}
`;
