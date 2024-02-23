import type { OnboardingConfig } from '@onefootprint/types';
import { Button, Text, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useUpdatePlaybook from '@/playbooks/hooks/use-update-playbook';

export type EditNameProps = {
  playbook: OnboardingConfig;
  onDone: () => void;
};

type FormData = {
  name: string;
};

const EditName = ({ playbook, onDone }: EditNameProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.basics.edit-name',
  });
  const mutation = useUpdatePlaybook();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: playbook.name,
    },
  });

  const handleClose = () => {
    onDone();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    mutation.mutate(
      { id: playbook.id, name: formData.name },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
    onDone();
  };
  return (
    <Form onSubmit={handleSubmit(handleBeforeSubmit)} id="edit-playbook-form">
      <InputContainer>
        <Text variant="label-4" color="tertiary">
          {t('form.label')}
        </Text>
        <TextInput
          autoFocus
          hasError={!!errors.name}
          hint={errors?.name?.message}
          placeholder=""
          size="compact"
          {...register('name')}
        />
      </InputContainer>
      <ButtonContainer>
        <Button variant="secondary" size="small" onClick={onDone}>
          {t('form.cancel')}
        </Button>
        <Button variant="primary" size="small" type="submit">
          {t('form.save')}
        </Button>
      </ButtonContainer>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.spacing[6]};
  `};
`;

const InputContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `};
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    justify-content: flex-end;
  `}
`;

export default EditName;
