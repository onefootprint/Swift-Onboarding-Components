import type { FootprintBootstrapData } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind, identifyFootprintUser } from '@onefootprint/footprint-js';
import { Button, Container, Divider, PhoneInput, Text, TextInput, createFontStyles } from '@onefootprint/ui';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import validateUserData from './utils/validate-user-data';

type FormData = {
  email?: string;
  phoneNumber?: string;
  name?: string;
};

const publicKeyEnv = process.env.NEXT_PUBLIC_TENANT_KEY ?? '';

type FormProps = {
  onSuccess: () => void;
};

const Form = ({ onSuccess }: FormProps) => {
  const router = useRouter();
  const { ob_key: obKey } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;
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

  const getUserData = (): FootprintBootstrapData => {
    const bootstrapData: FootprintBootstrapData = {
      'id.email': getValues('email'),
      'id.phone_number': getValues('phoneNumber'),
    };

    const names = getValues('name')?.split(' ') || [];
    if (names.length >= 2) {
      const firstName = names.splice(0, 1)[0];
      const lastName = names.pop();
      const middleName = names.join(' ');
      bootstrapData['id.first_name'] = firstName;
      bootstrapData['id.middle_name'] = middleName;
      bootstrapData['id.last_name'] = lastName;
    }

    return bootstrapData;
  };

  const showFootprint = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Verify,
      bootstrapData: getUserData(),
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
    const bootstrapData = getUserData();
    const email = bootstrapData['id.email'];
    const phoneNumber = bootstrapData['id.phone_number'];
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
      <Content>
        <Image src="/logo-acme-bank.png" width={187} height={40} alt="Logo" />
        <Text variant="display-3" tag="h3">
          Help us verify your identity
        </Text>
        <Text variant="body-2">
          We will need to collect some personal information to confirm and protect your identity when you create your
          account at AcmeBank. To learn more about how we process this data, please see our privacy policy.
        </Text>
      </Content>
      <FormContainer>
        <InputsContainer>
          <TextInput label="Full Name" placeholder="Jane Doe" type="text" {...register('name')} />
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
            render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
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
        <Button fullWidth size="large" variant="secondary" onClick={showFootprint}>
          Continue
        </Button>
        <OrDivider>
          <Divider />
          <Text variant="body-3" color="tertiary">
            or
          </Text>
        </OrDivider>
        <Button onClick={showFootprint} size="large" fullWidth>
          Verify with Footprint
        </Button>
      </FormContainer>
    </Container>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    img {
      margin: 0 auto ${theme.spacing[7]};
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
    width: 100%;

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

export default Form;
