import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { BusinessData, BusinessDataAttribute } from '@onefootprint/types';
import { Button, PhoneInput, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { BasicData } from '../../../../utils/state-machine/types';
import PHONE_REGEX from './constants';

type FormData = BasicData;

type OptionalFields =
  | BusinessDataAttribute.phoneNumber
  | BusinessDataAttribute.website;

export type BasicDataFormProps = {
  defaultValues?: Pick<
    BusinessData,
    | BusinessDataAttribute.name
    | BusinessDataAttribute.tin
    | BusinessDataAttribute.phoneNumber
    | BusinessDataAttribute.website
  >;
  optionalFields?: OptionalFields[];
  isLoading: boolean;
  onSubmit: (data: BasicData) => void;
  ctaLabel?: string;
};

const BasicDataForm = ({
  defaultValues,
  optionalFields,
  isLoading,
  onSubmit,
  ctaLabel,
}: BasicDataFormProps) => {
  const { allT, t } = useTranslation('pages.basic-data.form');
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });
  const inputMasks = useInputMask('en-US');

  const tinErrors = errors[BusinessDataAttribute.tin];
  const hasTinError = !!tinErrors;
  const tinHint = hasTinError ? tinErrors?.message : undefined;

  const phoneNumberErrors = errors[BusinessDataAttribute.phoneNumber];
  const hasPhoneNumberError = !!phoneNumberErrors;
  const phoneNumberHint = hasPhoneNumberError
    ? phoneNumberErrors?.message
    : undefined;

  const websiteErrors = errors[BusinessDataAttribute.website];
  const hasWebsiteError = !!websiteErrors;
  const websiteHint = hasWebsiteError ? websiteErrors?.message : undefined;

  const onSubmitFormData = (formData: FormData) => {
    const basicData = {
      [BusinessDataAttribute.name]: formData[BusinessDataAttribute.name],
      [BusinessDataAttribute.tin]: formData[BusinessDataAttribute.tin],
      [BusinessDataAttribute.phoneNumber]:
        formData[BusinessDataAttribute.phoneNumber],
      [BusinessDataAttribute.website]: formData[BusinessDataAttribute.website],
    };
    onSubmit(basicData);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitFormData)}>
      <TextInput
        data-private
        hasError={!!errors[BusinessDataAttribute.name]}
        hint={
          errors[BusinessDataAttribute.name]
            ? t('business-name.error')
            : undefined
        }
        label={t('business-name.label')}
        placeholder={t('business-name.placeholder')}
        {...register(BusinessDataAttribute.name, { required: true })}
      />
      <TextInput
        data-private
        hasError={hasTinError}
        hint={tinHint}
        mask={inputMasks.tin}
        value={getValues(BusinessDataAttribute.tin)}
        label={t('tin.label')}
        placeholder={t('tin.placeholder')}
        {...register(BusinessDataAttribute.tin, {
          required: {
            value: true,
            message: t('tin.errors.required'),
          },
          pattern: {
            value: /^\d{2}-\d{7}$/,
            message: t('tin.errors.pattern'),
          },
        })}
      />
      {optionalFields?.includes(BusinessDataAttribute.website) && (
        <TextInput
          data-private
          hasError={hasWebsiteError}
          hint={websiteHint}
          label={t('website.label')}
          placeholder={t('website.placeholder')}
          type="url"
          defaultValue={getValues(BusinessDataAttribute.website)}
          {...register(BusinessDataAttribute.website, {
            required: {
              value: true,
              message: t('website.errors.required'),
            },
          })}
        />
      )}
      {optionalFields?.includes(BusinessDataAttribute.phoneNumber) && (
        <PhoneInput
          data-private
          hasError={hasPhoneNumberError}
          hint={phoneNumberHint}
          label={t('phone-number.label')}
          placeholder={t('phone-number.placeholder')}
          onReset={() => {
            setValue(BusinessDataAttribute.phoneNumber, undefined);
          }}
          value={getValues(BusinessDataAttribute.phoneNumber)}
          {...register(BusinessDataAttribute.phoneNumber, {
            required: {
              value: true,
              message: t('phone-number.errors.required'),
            },
            pattern: {
              value: PHONE_REGEX,
              message: t('phone-number.errors.pattern'),
            },
          })}
        />
      )}
      <Button type="submit" fullWidth loading={isLoading}>
        {ctaLabel ?? allT('pages.cta-continue')}
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default BasicDataForm;
