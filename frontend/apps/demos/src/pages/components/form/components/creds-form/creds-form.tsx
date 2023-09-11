import styled, { css } from '@onefootprint/styled';
import { Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import type { ClientTokenResponse } from 'src/hooks/use-client-token';
import useClientToken from 'src/hooks/use-client-token';

type FormData = {
  userId: string;
  secretKey: string;
  cardAlias: string;
};

type CredsFormProps = {
  onSubmit: (authToken: string) => void;
};

const CredsForm = ({ onSubmit }: CredsFormProps) => {
  const clientTokenMutation = useClientToken();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      cardAlias: 'primary',
    },
  });

  const handleBeforeSubmit = (data: FormData) => {
    // Generate an auth token to use in the secure form
    clientTokenMutation.mutate(
      {
        ...data,
      },
      {
        onSuccess: (response: ClientTokenResponse) => {
          const authToken = response.token;
          onSubmit(authToken);
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit(handleBeforeSubmit)}>
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
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
    text-align: left;
  `}
`;

export default CredsForm;
