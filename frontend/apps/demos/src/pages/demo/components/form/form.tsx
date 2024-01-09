import type { FootprintUserData } from '@onefootprint/footprint-js';
import footprint, {
  FootprintComponentKind,
  identifyFootprintUser,
} from '@onefootprint/footprint-js';
import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import styled, { css } from '@onefootprint/styled';
import {
  Button,
  Container,
  createFontStyles,
  Divider,
  PhoneInput,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import debounce from 'lodash/debounce';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';

import validateUserData from './utils/validate-user-data';

type FormData = {
  email?: string;
  phoneNumber?: string;
  name?: string;
};

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY ?? '';

type FormProps = {
  html: string;
  onSuccess: () => void;
};

const Form = ({ html, onSuccess }: FormProps) => {
  const { control, register, getValues } = useForm<FormData>();

  const handleFootprintCompleted = (validationToken: string) => {
    console.log('completed', validationToken);
    onSuccess();
  };

  const handleFootprintClosed = () => {
    console.log('closed');
  };

  const handleFootprintCanceled = () => {
    console.log('canceled');
  };

  const getUserData = (): FootprintUserData => {
    const userData: FootprintUserData = {
      'id.email': getValues('email'),
      'id.phone_number': getValues('phoneNumber'),
    };

    const names = getValues('name')?.split(' ') || [];
    if (names.length >= 2) {
      const firstName = names.splice(0, 1)[0];
      const lastName = names.pop();
      const middleName = names.join(' ');
      userData['id.first_name'] = firstName;
      userData['id.middle_name'] = middleName;
      userData['id.last_name'] = lastName;
    }

    return userData;
  };

  const showFootprint = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Verify,
      userData: getUserData(),
      publicKey,
      onCancel: handleFootprintCanceled,
      onClose: handleFootprintClosed,
      onComplete: handleFootprintCompleted,
      options: {
        showCompletionPage: true,
      },
      l10n: { locale: 'en-US' },
    });

    component.render();
  };

  const handleChange = async () => {
    const userData = getUserData();
    const email = userData['id.email'];
    const phoneNumber = userData['id.phone_number'];
    const isValidUserData = validateUserData(email, phoneNumber);
    if (!isValidUserData) {
      return;
    }
    try {
      const foundUser = await identifyFootprintUser({
        'id.email': email,
        'id.phone_number': phoneNumber,
      });
      if (foundUser) {
        showFootprint();
      }
    } catch (_) {
      // do nothing
    }
  };

  const debouncedHandleChange = useCallback(debounce(handleChange, 300), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <Content dangerouslySetInnerHTML={{ __html: html }} />
      <FormContainer>
        <InputsContainer>
          <TextInput
            label="Full Name"
            placeholder="Jane Doe"
            type="text"
            {...register('name')}
          />
          <TextInput
            label="Email address"
            placeholder="jane.doe@email.com"
            type="email"
            {...register('email', {
              onChange: debouncedHandleChange,
            })}
          />
          <Controller
            control={control}
            name="phoneNumber"
            render={({
              field: { onChange, onBlur, value, name },
              fieldState: { error },
            }) => (
              <PhoneInput
                name={name}
                onBlur={onBlur}
                value={value}
                hasError={!!error}
                hint={error?.message}
                label="Phone number"
                onChange={event => {
                  onChange(event);
                  debouncedHandleChange();
                }}
              />
            )}
          />
        </InputsContainer>
        <Button fullWidth variant="secondary" onClick={showFootprint}>
          Continue
        </Button>
        <OrDivider>
          <StyledDivider />
          <Typography variant="body-3" color="tertiary">
            or
          </Typography>
        </OrDivider>
        <FootprintVerifyButton onClick={showFootprint} />
      </FormContainer>
    </Container>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    img {
      margin-bottom: ${theme.spacing[7]};
    }

    h1,
    h2,
    h3 {
      ${createFontStyles('heading-2')};
      color: ${theme.color.primary};
      margin-bottom: ${theme.spacing[7]};
    }

    p {
      ${createFontStyles('body-1')};
      color: ${theme.color.secondary};
    }
  `}
`;

const FormContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
    margin-left: auto;
    margin-right: auto;
    max-width: 450px;

    .footprint-verify-button {
      width: 100%;
    }
  `}
`;

const InputsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    text-align: center;
    row-gap: ${theme.spacing[5]};
    text-align: initial;
    margin-bottom: ${theme.spacing[7]};

    > * {
      width: 100%;
      /* patch to fix a bug happening to the phone input positioning absolutely without apparent reason */
      && {
        position: relative;
      }
    }
  `}
`;

const OrDivider = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('heading-2')};
    padding: ${theme.spacing[7]} 0;
    position: relative;

    > p {
      width: fit-content;
      background: white;
      z-index: 1;
      padding: 0 ${theme.spacing[4]};
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, 100%);
      line-height: 1;
    }
  `}
`;

const StyledDivider = styled(Divider)`
  position: absolute;
  top: 50%;
  width: 100%;
`;

export default Form;
