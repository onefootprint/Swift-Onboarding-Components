import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import {
  Controller,
  ControllerRenderProps,
  FieldError,
  FieldValues,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import CitizenshipField from './citizenship-field';
import CountryOfBirthField from './country-of-birth-field';

const CountryFields = () => {
  const { t } = useTranslation('pages.legal-status.form');
  const { control } = useFormContext();
  const { append, fields, remove } = useFieldArray({
    name: 'citizenships',
    control,
  });

  const getErrorMessage = (error?: FieldError) => {
    if (error) {
      if (error.type === 'empty') {
        return t('citizenship.empty-error');
      }
      if (error.type === 'usCitizen') {
        return t('citizenship.us-citizen-error');
      }
    }
    return undefined;
  };

  const renderAddButton = (
    index: number,
    value: string,
    error?: FieldError,
  ) => {
    // Allow additional citizenships if user has filled out at least 1, with a maximum of 3
    const isLastCitizenship = index === fields.length - 1;
    const correctNumCitizenships =
      (!!value || fields.length > 1) && fields.length < 3;
    return isLastCitizenship && correctNumCitizenships ? (
      <LinkButton
        disabled={!!error || !value}
        iconComponent={IcoPlusSmall16}
        iconPosition="left"
        onClick={() => append({ label: '', value: undefined })}
        size="compact"
        testID="add-citizenship-button"
      >
        {t('citizenship.add-text')}
      </LinkButton>
    ) : null;
  };

  const renderCitizenshipFields = (
    index: number,
    field: ControllerRenderProps<FieldValues, `citizenships.${number}`>,
    error?: FieldError,
  ) => {
    const {
      value: { value },
      onChange,
    } = field;
    const errorMessage = getErrorMessage(error);

    return (
      <>
        <CitizenshipField
          field={field}
          onChange={nextValue => onChange(nextValue)}
          hasDeleteButton={fields.length > 1}
          onDelete={() => remove(index)}
          hasError={!!errorMessage}
          hint={errorMessage}
        />
        {renderAddButton(index, value, error)}
      </>
    );
  };

  return (
    <>
      <CountryOfBirthField />
      {fields.map((citizenshipField, index) => (
        <Controller
          key={citizenshipField.id}
          data-private
          name={`citizenships.${index}`}
          control={control}
          rules={{
            required: true,
            validate: {
              empty: ({ value }) => !!value,
              usCitizen: ({ value }) => value !== 'US',
            },
          }}
          render={({ field, fieldState: { error } }) =>
            renderCitizenshipFields(index, field, error)
          }
        />
      ))}
    </>
  );
};

export default CountryFields;
