import { Select, Text, TextInput, useToast } from '@onefootprint/ui';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import type { ToolFormProps } from '../../toolbox';
import useCleanUp from './hooks/use-clean-up';

enum IdentifierType {
  phoneNumber = 'phone_number',
  email = 'email',
}

type CleanUpUserFormData = {
  identifier: string;
  type: { label: string; value: IdentifierType };
};

const makeOption = (value: string) => ({
  label: value,
  value,
});

const useCleanUpUserForm = ({ formId, onClose }: ToolFormProps) => {
  const cleanUpMutation = useCleanUp();
  const toast = useToast();
  const methods = useForm<CleanUpUserFormData>({
    defaultValues: {
      type: {
        label: IdentifierType.phoneNumber,
        value: IdentifierType.phoneNumber,
      },
    },
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleBeforeSubmit = async (data: CleanUpUserFormData) => {
    let requestData = {};
    if (data.type.value === IdentifierType.phoneNumber) {
      requestData = { phoneNumber: data.identifier };
    } else if (data.type.value === IdentifierType.email) {
      requestData = { email: data.identifier };
    }
    cleanUpMutation.mutate(requestData, {
      onSuccess: d => {
        toast.show({
          title: 'Success',
          description: `Deleted ${d.numDeletedRows} rows`,
        });
        onClose();
      },
    });
  };

  const component = (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Text variant="label-3">{`Enter the identifier for the user you'd like to delete`}</Text>
        <TextInput
          label="Identifier"
          placeholder="+15555550100"
          hasError={!!errors.identifier}
          {...register('identifier', { required: true })}
        />
        <Controller
          control={control}
          name="type"
          rules={{ required: true }}
          render={({ field, fieldState: { error } }) => (
            <Select
              isPrivate
              label="Identifier kind"
              onBlur={field.onBlur}
              options={[makeOption(IdentifierType.phoneNumber), makeOption(IdentifierType.email)]}
              onChange={field.onChange}
              hint={error && 'Invalid'}
              hasError={!!error}
              value={field.value}
            />
          )}
        />
      </StyledForm>
    </FormProvider>
  );
  return {
    component,
    isLoading: cleanUpMutation.isLoading,
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
