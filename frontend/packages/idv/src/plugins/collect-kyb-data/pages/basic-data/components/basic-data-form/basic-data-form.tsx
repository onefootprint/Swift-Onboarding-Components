import { useInputMask } from '@onefootprint/hooks';
import { BusinessDI, CorporationType, type PublicOnboardingConfig } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import { Grid, PhoneInput, Select, Stack, TextInput } from '@onefootprint/ui';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isURL } from '@onefootprint/core';
import EditableFormButtonContainer from '../../../../../../components/editable-form-button-container';
import { useL10nContext } from '../../../../../../components/l10n-provider';
import checkIsPhoneValid from '../../../../../../utils/check-is-phone-valid';
import type { BasicData } from '../../../../utils/state-machine/types';

type FormHints = Partial<{ [K in keyof FormData]: string }>;
type FormProps = (keyof FormData)[];
type FormErrors = Partial<{ [K in keyof FormData]: { message?: string } }>;
type FormData = {
  corporationType?: SelectOption;
  doingBusinessAs?: string;
  name: string;
  phoneNumber?: string;
  tin: string;
  website?: string;
};

export type BasicDataFormProps = {
  config?: PublicOnboardingConfig;
  ctaLabel?: string;
  defaultValues?: Partial<FormData>;
  hideInputTin?: boolean;
  isLoading: boolean;
  onCancel?: () => void;
  onSubmit: (data: BasicData) => void;
  optionalFields?: (BusinessDI.corporationType | BusinessDI.phoneNumber | BusinessDI.website)[];
};

const getFormHints = (list: FormProps, errors: FormErrors): FormHints => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.basic-data.form' });
  return list.reduce<FormHints>((hints, prop) => {
    const error = errors[prop];
    if (error?.message) {
      hints[prop] = error.message; // eslint-disable-line no-param-reassign
    } else if (prop === 'tin') {
      hints[prop] = t('must-be-ein');
    }
    return hints;
  }, Object.create(null));
};

const FormHintsList: FormProps = ['phoneNumber', 'tin', 'website'];

const BasicDataForm = ({
  config,
  ctaLabel,
  defaultValues,
  hideInputTin,
  isLoading,
  onCancel,
  onSubmit,
  optionalFields,
}: BasicDataFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.basic-data.form' });
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

  const getFormPhoneState = (value?: string): boolean => {
    if (value && !checkIsPhoneValid(value, !config?.isLive)) {
      setError('phoneNumber', { message: t('phone-number.errors.pattern') }, { shouldFocus: true });
      return false;
    }
    return true;
  };

  const onSubmitFormData = (formData: FormData) => {
    const basicData = {
      [BusinessDI.name]: formData.name,
      [BusinessDI.doingBusinessAs]: formData.doingBusinessAs ? formData.doingBusinessAs : undefined,
      ...(hideInputTin ? {} : { [BusinessDI.tin]: formData.tin }),
      [BusinessDI.corporationType]: formData.corporationType?.value,
      [BusinessDI.phoneNumber]: formData.phoneNumber,
      [BusinessDI.website]: formData.website,
    };

    const isPhoneValid = getFormPhoneState(formData.phoneNumber);
    if (!isPhoneValid) return;

    onSubmit(basicData);
  };

  const corporationTypeOptions = Object.values(CorporationType).map(value => ({
    label: t(`corporation-type.mapping.${value}`),
    value,
  }));

  return (
    <Grid.Container tag="form" gap={7} width="100%" onSubmit={handleSubmit(onSubmitFormData)}>
      <Stack gap={6} direction="column">
        <TextInput
          autoFocus
          data-dd-privacy="mask"
          data-dd-action-name="Business name"
          hasError={!!errors.name}
          hint={errors.name ? t('business-name.error') : undefined}
          label={t('business-name.label')}
          placeholder={t('business-name.placeholder')}
          {...register('name', { required: true })}
        />
        <TextInput
          data-dd-privacy="mask"
          label={t('doing-business-as.label')}
          placeholder={t('doing-business-as.placeholder')}
          {...register('doingBusinessAs', { setValueAs: value => value.trim() || undefined })}
        />
        {hideInputTin ? null : (
          <TextInput
            data-dd-privacy="mask"
            data-dd-action-name="Business Tin"
            hasError={!!errors.tin}
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
        )}
        {optionalFields?.includes(BusinessDI.corporationType) && (
          <Controller
            data-dd-privacy="mask"
            data-dd-action-name="Business corporation type"
            control={control}
            name="corporationType"
            rules={{
              required: {
                value: true,
                message: t('corporation-type.error'),
              },
            }}
            render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
              <Select<{ label: string; value: string }>
                data-dd-privacy="mask"
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
            data-dd-privacy="mask"
            data-dd-action-name="Business website"
            hasError={!!websiteHint}
            hint={websiteHint}
            label={t('website.label')}
            placeholder={t('website.placeholder')}
            defaultValue={getValues('website')}
            {...register('website', {
              required: {
                value: true,
                message: t('website.errors.required'),
              },
              validate: value => {
                if (!isURL(value ?? '')) {
                  return t('website.errors.pattern');
                }
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
            render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
              <PhoneInput
                data-dd-privacy="mask"
                data-dd-action-name="Business phone number"
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
                locale={l10n?.locale}
              />
            )}
          />
        )}
      </Stack>
      <EditableFormButtonContainer
        onCancel={onCancel}
        isLoading={isLoading}
        ctaLabel={ctaLabel}
        submitButtonTestID="kyb-basic"
      />
    </Grid.Container>
  );
};

export default BasicDataForm;
