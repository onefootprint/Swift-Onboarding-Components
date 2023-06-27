import { SecureForm, SecureFormType } from '@onefootprint/components';
import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import {
  Button,
  media,
  TextInput,
  Typography,
  useToast,
} from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import useClientToken, { ClientTokenResponse } from './hooks/use-client-token';

type FormData = {
  userId: string;
  secretKey: string;
  cardAlias: string;
};

const SecureFormDemo = () => {
  const [showSecureForm, setShowSecureForm] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>();
  const toast = useToast();
  const clientTokenMutation = useClientToken();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      cardAlias: 'primary',
    },
  });

  const onSubmit = (data: FormData) => {
    // Generate an auth token to use in the secure form
    clientTokenMutation.mutate(
      {
        ...data,
      },
      {
        onSuccess: (response: ClientTokenResponse) => {
          setAuthToken(response.token);
          setShowSecureForm(true);
        },
      },
    );
  };

  const handleSave = () => {
    const dashboardUrl = `${DASHBOARD_BASE_URL}/users/${getValues('userId')}`;
    const dashboardLink = <Link href={dashboardUrl}>your dashboard</Link>;
    toast.show({
      title: 'Payment method saved',
      description: (
        <span>
          User saved the payment method form. Please visit {dashboardLink} to
          decrypt and view.
        </span>
      ),
    });
  };

  const handleCancel = () => {
    toast.show({
      variant: 'error',
      title: 'Payment method not saved',
      description: 'User cancelled the payment method form',
    });
  };

  return (
    <Container>
      <Inner>
        <Head>
          <title>Footprint Components Demo</title>
        </Head>
        <Typography variant="heading-2" sx={{ marginTop: 9 }}>
          Secure Form Demo
        </Typography>
        {showSecureForm && authToken ? (
          <SecureFormContainer>
            <SecureForm
              authToken={authToken}
              cardAlias={getValues('cardAlias')}
              title="Your payment information"
              type={SecureFormType.cardAndName}
              variant="card"
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </SecureFormContainer>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              autoFocus
              label="Footprint User Id"
              placeholder="fp_123456789"
              hasError={!!errors.userId}
              hint={errors?.userId && 'Please enter a valid Footprint user ID'}
              {...register('userId', { required: true })}
            />
            <TextInput
              label="API Secret Key"
              placeholder="sk_123456789"
              hasError={!!errors.secretKey}
              hint={errors?.secretKey && 'Please enter a valid API secret key'}
              {...register('secretKey', { required: true })}
            />
            <TextInput
              label="Card Alias"
              placeholder="primary"
              hasError={!!errors.cardAlias}
              hint={errors?.cardAlias && 'Please enter a valid card alias'}
              {...register('cardAlias', { required: true })}
            />
            <Button loading={clientTokenMutation.isLoading} type="submit">
              Continue
            </Button>
          </Form>
        )}
      </Inner>
    </Container>
  );
};

const SecureFormContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100vh;

    ${media.greaterThan('md')`
      height: 600px;
      padding: ${theme.spacing[2]};
    `}
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
    text-align: left;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    text-align: center;
    width: 100%;
    height: 100%;
    padding: ${theme.spacing[7]} ${theme.spacing[7]};

    ${media.greaterThan('md')`
      border-radius: ${theme.borderRadius.compact};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      width: 90%;
      max-width: 700px;
      height: unset;
    `}
  `}
`;

export default SecureFormDemo;
