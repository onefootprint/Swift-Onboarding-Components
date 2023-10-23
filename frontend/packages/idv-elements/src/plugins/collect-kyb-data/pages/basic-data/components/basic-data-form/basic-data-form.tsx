import { useInputMask, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { BusinessDI, CorporationType } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import { PhoneInput, Select, Stack, TextInput } from '@onefootprint/ui';
import React from 'react';
import type { UseFormSetError } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../../../components/editable-form-button-container';
import { useL10nContext } from '../../../../../../components/l10n-provider';
import checkIsPhoneValid from '../../../../../../services/identify/pages/phone-identification/components/form/utils/check-is-phone-valid';
import type { BasicData } from '../../../../utils/state-machine/types';

type FormData = {
  name: string;
  tin: string;
  doingBusinessAs?: string;
  corporationType?: SelectOption;
  phoneNumber?: string;
  website?: string;
};

type FormHints = Partial<{ [K in keyof FormData]: string }>;
type FormProps = (keyof FormData)[];
type FormErrors = Partial<{ [K in keyof FormData]: { message?: string } }>;
type T = ReturnType<typeof useTranslation>['t'];

export type BasicDataFormProps = {
  defaultValues?: Partial<FormData>;
  optionalFields?: (
    | BusinessDI.corporationType
    | BusinessDI.phoneNumber
    | BusinessDI.website
  )[];
  isLoading: boolean;
  onSubmit: (data: BasicData) => void;
  onCancel?: () => void;
  ctaLabel?: string;
  config?: PublicOnboardingConfig;
};

const getFormHints = (list: FormProps, errors: FormErrors): FormHints =>
  list.reduce<FormHints>((hints, prop) => {
    const error = errors[prop];
    if (error && error?.message) {
      hints[prop] = error.message; // eslint-disable-line no-param-reassign
    }
    return hints;
  }, Object.create(null));

const getFormPhoneState = (
  t: T,
  setError: UseFormSetError<FormData>,
  config?: PublicOnboardingConfig,
  value?: string,
): boolean => {
  if (value && !checkIsPhoneValid(value, !config?.isLive)) {
    setError(
      'phoneNumber',
      { message: t('phone-number.errors.pattern') },
      { shouldFocus: true },
    );
    return false;
  }
  return true;
};

const FormHintsList: FormProps = ['phoneNumber', 'tin', 'website'];

const BasicDataForm = ({
  defaultValues,
  optionalFields,
  isLoading,
  onSubmit,
  onCancel,
  ctaLabel,
  config,
}: BasicDataFormProps) => {
  const { t } = useTranslation('pages.basic-data.form');
  const l10n = useL10nContext();
  const inputMasks = useInputMask(l10n?.locale);
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ defaultValues });

  const {
    phoneNumber: phoneNumberHint = undefined,
    tin: tinHint = undefined,
    website: websiteHint = undefined,
  } = getFormHints(FormHintsList, errors);

  const onSubmitFormData = (formData: FormData) => {
    const basicData = {
      [BusinessDI.name]: formData.name,
      [BusinessDI.doingBusinessAs]: formData.doingBusinessAs
        ? formData.doingBusinessAs
        : undefined,
      [BusinessDI.tin]: formData.tin,
      [BusinessDI.corporationType]: formData.corporationType?.value,
      [BusinessDI.phoneNumber]: formData.phoneNumber,
      [BusinessDI.website]: formData.website,
    };
    const isPhoneValid = getFormPhoneState(
      t,
      setError,
      config,
      formData.phoneNumber,
    );
    if (!isPhoneValid) return;

    onSubmit(basicData);
  };

  const corporationTypeOptions = Object.values(CorporationType).map(value => ({
    label: t(`corporation-type.mapping.${value}`),
    value,
  }));

  return (
    <Form onSubmit={handleSubmit(onSubmitFormData)}>
      <Stack gap={5} direction="column">
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
          hasError={!!tinHint}
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

        {optionalFields?.includes(BusinessDI.corporationType) && (
          <Controller
            data-private
            control={control}
            name="corporationType"
            rules={{
              required: {
                value: true,
                message: t('corporation-type.error'),
              },
            }}
            render={({
              field: { onChange, onBlur, value, name },
              fieldState: { error },
            }) => (
              <Select
                data-private
                hasError={!!error}
                label={t('corporation-type.label')}
                options={corporationTypeOptions}
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
              />
            )}
          />
        )}

        {optionalFields?.includes(BusinessDI.website) && (
          <TextInput
            data-private
            hasError={!!websiteHint}
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
            }}
            render={({
              field: { onChange, onBlur, value, name },
              fieldState: { error },
            }) => (
              <PhoneInput
                data-private
                hasError={!!error && !!phoneNumberHint}
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
      </Stack>
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
