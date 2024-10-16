import { Form } from '@onefootprint/ui';
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
  const { t } = useTranslation('playbook-details', {
    keyPrefix: 'header.edit-name.form',
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
        <Form.Field>
          <Form.Label>{t('label')}</Form.Label>
          <Form.Input
            autoFocus
            hasError={!!errors.name}
            hint={errors?.name?.message}
            defaultValue={playbookName}
            placeholder=""
            {...register('name')}
          />
          <Form.Errors> {!!errors.name}</Form.Errors>
        </Form.Field>
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
