import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';
import { Button, media, TextInput, Typography } from 'ui';

import useSubscribeUser from './hooks/use-subscribe-user';

type FormData = {
  email: string;
};

const SubscribeToNewsletter = () => {
  const { t } = useTranslation('components.subscribe-to-newsletter');
  const subscribeUser = useSubscribeUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    subscribeUser.mutate({ email: formData.email });
  };

  return (
    <FormContainer>
      <FormHeader>
        <Typography variant="heading-3" sx={{ marginBottom: 4 }}>
          {t('title')}
        </Typography>
        <Typography variant="body-2" color="secondary">
          {t('description')}
        </Typography>
      </FormHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {!subscribeUser.isSuccess && (
          <FieldsContainer>
            <TextInput
              hasError={!!errors.email}
              hint={errors.email && t('form.error')}
              placeholder={t('form.placeholder')}
              autoComplete="false"
              required
              type="email"
              {...register('email', {
                required: true,
              })}
            />
            <Button
              size="compact"
              type="submit"
              loading={subscribeUser.isLoading}
            >
              {t('form.cta')}
            </Button>
          </FieldsContainer>
        )}
      </Form>
      {subscribeUser.isSuccess && (
        <Typography variant="caption-1" color="tertiary">
          {t('form.success')}
        </Typography>
      )}
      {subscribeUser.isError && (
        <Typography variant="caption-1" color="error">
          {t('form.error')}
        </Typography>
      )}
    </FormContainer>
  );
};

const FieldsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    > :first-child {
      margin-right: ${theme.spacing[4]}px;
      margin-bottom: 0;
      width: 300px;
    }

    > button {
      width: 120px;
    }

    ${media.lessThan('sm')`
      flex-direction: column;
      row-gap: ${theme.spacing[4]}px;
      
      > :first-child {
        margin-right: 0;
        width: 100%;
      } 

      > button {
        width: 100%;
      }
    `}
  `}
`;

const Form = styled.form`
  flex-grow: 1;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

const FormHeader = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  `}
`;

const FormContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: ${theme.spacing[11]}px 0;
    text-align: center;
    padding: 0 ${theme.spacing[10]}px;

    ${media.lessThan('sm')`
      padding: 0;
    `}
  `}
`;

export default SubscribeToNewsletter;
