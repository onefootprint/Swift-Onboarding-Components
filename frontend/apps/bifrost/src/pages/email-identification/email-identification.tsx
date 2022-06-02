import React from 'react';
import { useForm } from 'react-hook-form';
import {
  ChallengeKind,
  Events,
  UserData,
  UserDataAttribute,
} from 'src/bifrost-machine/types';
import useBifrostMachine from 'src/hooks/bifrost/use-bifrost-machine';
import useIdentify, { IdentifyResponse } from 'src/hooks/identify/use-identify';
import styled, { css } from 'styled';
import { Button, TextInput, Typography } from 'ui';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const [, send] = useBifrostMachine();

  const identifyMutation = useIdentify();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    const { email } = formData;
    identifyMutation.mutate(
      { identifier: { email }, preferredChallengeKind: ChallengeKind.sms },
      {
        onSuccess({ userFound, challengeData }: IdentifyResponse) {
          if (userFound) {
            send({
              type: Events.userIdentifiedByEmail,
              payload: {
                email,
                challengeData,
                userFound,
              },
            });
            return;
          }
          send({
            type: Events.userNotIdentified,
            payload: {
              email,
              userFound,
            },
          });
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextContainer>
        <Typography variant="heading-2" color="primary">
          Hey there! 👋
        </Typography>
        <Typography variant="body-2" color="secondary">
          Enter your email to get started.
        </Typography>
      </TextContainer>
      <TextInput
        hasError={!!errors.email}
        hintText={errors.email && 'Email is required'}
        label="Email"
        placeholder="your.email@email.com"
        type="email"
        {...register('email', { required: true })}
      />
      <Button fullWidth type="submit" loading={identifyMutation.isLoading}>
        Continue
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

const TextContainer = styled.div`
  text-align: center;
`;

export default EmailIdentification;
