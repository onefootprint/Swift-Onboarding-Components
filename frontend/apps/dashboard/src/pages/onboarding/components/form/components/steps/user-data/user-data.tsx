import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Grid, Portal, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import useUserSession from 'src/hooks/use-user-session';

import Header from '../header';

export type UserDataProps = {
  id: string;
  onComplete: () => void;
};

type FormData = {
  firstName: string;
  lastName: string;
};

const UserData = ({ id, onComplete }: UserDataProps) => {
  const { data, dangerouslyCastedData, mutation } = useUserSession();
  const { t, allT } = useTranslation('pages.onboarding.user-data');
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
    },
  });

  const handleSubmit = (formData: FormData) => {
    mutation.mutate(formData, {
      onSuccess: onComplete,
    });
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Form id={id} onSubmit={handleFormSubmit(handleSubmit)}>
        <TextInput
          disabled
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          type="email"
          value={dangerouslyCastedData.email}
        />
        <Grid.Row>
          <Grid.Column col={6}>
            <TextInput
              autoFocus
              hasError={!!errors.firstName}
              hint={
                errors.firstName
                  ? t('form.first-name.errors.required')
                  : undefined
              }
              label={t('form.first-name.label')}
              placeholder={t('form.first-name.placeholder')}
              {...register('firstName', {
                required: {
                  value: true,
                  message: t('form.first-name.errors.required'),
                },
              })}
            />
          </Grid.Column>
          <Grid.Column col={6}>
            <TextInput
              hasError={!!errors.lastName}
              hint={
                errors.lastName
                  ? t('form.last-name.errors.required')
                  : undefined
              }
              label={t('form.last-name.label')}
              placeholder={t('form.last-name.placeholder')}
              {...register('lastName', {
                required: {
                  value: true,
                  message: t('form.last-name.errors.required'),
                },
              })}
            />
          </Grid.Column>
        </Grid.Row>
        <Portal selector="#onboarding-cta-portal">
          <Button
            form={id}
            loading={mutation.isLoading}
            size="compact"
            type="submit"
          >
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

export default UserData;
