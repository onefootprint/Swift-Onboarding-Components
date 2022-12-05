import footprint, { identifyUser } from '@onefootprint/footprint-js';
import { FootprintButton } from '@onefootprint/footprint-react';
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
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import validateUserData from './utils/validate-user-data';

type FormData = {
  email?: string;
  phoneNumber?: string;
};

export const PHONE_REGEX = /^(\+)?([ 0-9]){10,16}$/;

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

type FormProps = {
  html: string;
  onSuccess: () => void;
};

const Form = ({ html, onSuccess }: FormProps) => {
  const { register, getValues } = useForm<FormData>();

  const handleFootprintCompleted = (validationToken: string) => {
    console.log('on completed', validationToken);
    onSuccess();
  };

  const handleFootprintCanceled = () => {
    console.log('user canceled!');
  };

  const showFootprint = () => {
    footprint.open({
      userData: {
        email: getValues('email'),
        phoneNumber: getValues('phoneNumber'),
      },
      publicKey,
      onCanceled: handleFootprintCanceled,
      onCompleted: handleFootprintCompleted,
    });
  };

  const bootstrap = async (email?: string, phoneNumber?: string) => {
    try {
      const foundUser = await identifyUser({ email, phoneNumber });
      if (foundUser) {
        showFootprint();
      }
    } catch (_) {
      // do nothing
    }
  };

  const handleChange = () => {
    const userData = {
      email: getValues('email'),
      phoneNumber: getValues('phoneNumber'),
    };
    const isValidUserData = validateUserData(userData);
    if (isValidUserData) {
      bootstrap(userData.email, userData.phoneNumber);
    }
  };

  const debouncedHandleChange = useCallback(debounce(handleChange, 300), []);

  return (
    <Container>
      <Content dangerouslySetInnerHTML={{ __html: html }} />
      <FormContainer>
        <InputsContainer>
          <TextInput
            label="Email address"
            placeholder="jane.doe@email.com"
            type="email"
            {...register('email', {
              onChange: debouncedHandleChange,
            })}
          />
          <PhoneInput
            label="Phone number"
            placeholder="+1 (123) 123 1234"
            {...register('phoneNumber', {
              pattern: {
                value: PHONE_REGEX,
                message: 'Phone number format is incorrect',
              },
              onChange: debouncedHandleChange,
            })}
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
        <FootprintButton publicKey={publicKey} />
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

    button {
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
