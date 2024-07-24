import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type EditNameFormData = {
  name: string;
};

type EditNameFormProps = {
  formId: string;
  playbookName: string;
  onSubmit: (data: EditNameFormData) => void;
};

const EditNameForm = ({ formId, playbookName, onSubmit }: EditNameFormProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'details.header.edit-name.form',
  });

  const methods = useForm<EditNameFormData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleBeforeSubmit = (data: EditNameFormData) => {
    onSubmit({
      ...data,
    });
  };

  return (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <TextInput
          autoFocus
          label={t('label')}
          hasError={!!errors.name}
          hint={errors?.name?.message}
          defaultValue={playbookName}
          placeholder=""
          {...register('name')}
        />
      </StyledForm>
    </FormProvider>
  );
};

const StyledForm = styled.form`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[4]};
  `}
`;

export default EditNameForm;
