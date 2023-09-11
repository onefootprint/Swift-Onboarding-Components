import { useInputMask, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { BusinessDI } from '@onefootprint/types';
import { PhoneInput, PhoneInputRegex, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../../../components/editable-form-button-container';
import type { BasicData } from '../../../../utils/state-machine/types';

type FormData = {
  name: string;
  tin: string;
  doingBusinessAs?: string;
  phoneNumber?: string;
  website?: string;
};

export type BasicDataFormProps = {
  defaultValues?: Partial<FormData>;
  optionalFields?: (BusinessDI.phoneNumber | BusinessDI.website)[];
  isLoading: boolean;
  onSubmit: (data: BasicData) => void;
  onCancel?: () => void;
  ctaLabel?: string;
};

const BasicDataForm = ({
  defaultValues,
  optionalFields,
  isLoading,
  onSubmit,
  onCancel,
  ctaLabel,
}: BasicDataFormProps) => {
  const { t } = useTranslation('pages.basic-data.form');
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });
  const inputMasks = useInputMask('en-US');

  const tinErrors = errors.tin;
  const hasTinError = !!tinErrors;
  const tinHint = hasTinError ? tinErrors?.message : undefined;

  const phoneNumberErrors = errors.phoneNumber;
  const hasPhoneNumberError = !!phoneNumberErrors;
  const phoneNumberHint = hasPhoneNumberError
    ? phoneNumberErrors?.message
    : undefined;

  const websiteErrors = errors.website;
  const hasWebsiteError = !!websiteErrors;
  const websiteHint = hasWebsiteError ? websiteErrors?.message : undefined;

  const onSubmitFormData = (formData: FormData) => {
    const basicData = {
      [BusinessDI.name]: formData.name,
      [BusinessDI.doingBusinessAs]: formData.doingBusinessAs
        ? formData.doingBusinessAs
        : undefined,
      [BusinessDI.tin]: formData.tin,
      [BusinessDI.phoneNumber]: formData.phoneNumber,
      [BusinessDI.website]: formData.website,
    };
    onSubmit(basicData);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitFormData)}>
      <TextInput
        data-private
        hasError={!!errors.name}
        hint={errors.name ? t('business-name.error') : undefined}
        label={t('business-name.label')}
        placeholder={t('business-name.placeholder')}
        {...register('name', { required: true })}
      />
      <TextInput
        data-private
        label={t('doing-business-as.label')}
        placeholder={t('doing-business-as.placeholder')}
        {...register('doingBusinessAs')}
      />
      <TextInput
        data-private
        hasError={hasTinError}
        hint={tinHint}
        mask={inputMasks.tin}
        value={getValues('tin')}
        label={t('tin.label')}
        placeholder={t('tin.placeholder')}
        {...register('tin', {
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
      {optionalFields?.includes(BusinessDI.website) && (
        <TextInput
          data-private
          hasError={hasWebsiteError}
          hint={websiteHint}
          label={t('website.label')}
          placeholder={t('website.placeholder')}
          type="url"
          defaultValue={getValues('website')}
          {...register('website', {
            required: {
              value: true,
              message: t('website.errors.required'),
            },
          })}
        />
      )}
      {optionalFields?.includes(BusinessDI.phoneNumber) && (
        <Controller
          control={control}
          name="phoneNumber"
          rules={{
            required: {
              value: true,
              message: t('phone-number.errors.required'),
            },
            pattern: {
              value: PhoneInputRegex,
              message: t('phone-number.errors.pattern'),
            },
          }}
          render={({
            field: { onChange, onBlur, value, name },
            fieldState: { error },
          }) => (
            <PhoneInput
              data-private
              hasError={!!error}
              hint={phoneNumberHint}
              label={t('phone-number.label')}
              name={name}
              onBlur={onBlur}
              onChange={onChange}
              onReset={() => {
                setValue('phoneNumber', undefined);
              }}
              value={value}
            />
          )}
        />
      )}
      <EditableFormButtonContainer
        onCancel={onCancel}
        isLoading={isLoading}
        ctaLabel={ctaLabel}
      />
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
    width: 100%;
  `}
`;

export default BasicDataForm;
