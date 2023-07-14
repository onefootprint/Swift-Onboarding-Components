import styled, { css } from '@onefootprint/styled';
import { DataIdentifier } from '@onefootprint/types';
import { Button, media, TextInput, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  userId: string;
  secretKey: string;
  fields: DataIdentifier[];
};

const SecureRenderDemo = () => {
  const [showSecureRender, setShowSecureRender] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>();
  // const decryptTokenMutation = useDecryptToken();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fields: [],
    },
  });

  const onSubmit = () => {
    setShowSecureRender(true);
    setAuthToken('token');
    // TODO:
    // Generate an auth token to use in the secure form
    // decryptTokenMutation.mutate(
    //   {
    //     ...data,
    //   },
    //   {
    //     onSuccess: (response: DecryptTokenResponse) => {
    //       setAuthToken(response.token);
    //       setShowSecureRender(true);
    //     },
    //   },
    // );
  };

  return (
    <Container>
      <Inner>
        <Head>
          <title>Footprint Components Demo</title>
        </Head>
        <Typography variant="heading-2" sx={{ marginTop: 9 }}>
          Secure Render Demo
        </Typography>
        {showSecureRender && authToken ? (
          <SecureRenderContainer>
            {/* TODO: render secureRender components here */}
          </SecureRenderContainer>
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
            <Button
              // loading={decryptTokenMutation.isLoading}
              type="submit"
            >
              Continue
            </Button>
          </Form>
        )}
      </Inner>
    </Container>
  );
};

const SecureRenderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
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

export default SecureRenderDemo;
