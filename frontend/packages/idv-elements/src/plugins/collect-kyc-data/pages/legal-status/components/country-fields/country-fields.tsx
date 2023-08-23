import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import {
  CountrySelect,
  CountrySelectOption,
  LinkButton,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import {
  Controller,
  FieldError,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import CitizenshipField from './citizenship-field';

const CountryFields = () => {
  const { t } = useTranslation('pages.legal-status.form');
  const [usCitizenSelectedIndex, setUSCitizenSelectedIndex] = useState(-1);
  const { control } = useFormContext();
  const { append, fields, remove } = useFieldArray({
    name: 'citizenships',
    control,
  });

  const handleCitizenshipChange = (
    index: number,
    onChange: (cso: CountrySelectOption) => void,
    { label, value }: CountrySelectOption,
  ) => {
    setUSCitizenSelectedIndex(value === 'US' ? index : -1);
    onChange({ label, value } as CountrySelectOption);
  };

  const getError = (index: number, value: string, error?: FieldError) => {
    if (error) {
      return t('citizenship.empty-error');
    }
    if (usCitizenSelectedIndex === index && value) {
      // Checks value to clear this error if user selects a different status
      return t('citizenship.us-citizen-error');
    }
    return undefined;
  };

  return (
    <>
      <Controller
        data-private
        name="nationality"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState: { error } }) => (
          <CountrySelect
            label={t('nationality.label')}
            onBlur={field.onBlur}
            placeholder={t('nationality.placeholder')}
            onChange={({ label, value }) => field.onChange({ label, value })}
            value={field.value}
            hasError={!!error}
            hint={error && t('nationality.error')}
            testID="nationality-select"
          />
        )}
      />
      {fields.map((citizenshipField, index) => (
        <Controller
          key={citizenshipField.id}
          data-private
          name={`citizenships.${index}`}
          control={control}
          rules={{
            required: true,
            validate: ({ value }) => !!value,
          }}
          render={({ field, fieldState: { error } }) => {
            const errorMessage = getError(index, field.value.value, error);

            return (
              <>
                <CitizenshipField
                  field={field}
                  onChange={nextValue =>
                    handleCitizenshipChange(
                      index,
                      field.onChange,
                      nextValue as CountrySelectOption,
                    )
                  }
                  hasDeleteButton={fields.length > 1}
                  onDelete={() => remove(index)}
                  hasError={!!errorMessage}
                  hint={errorMessage}
                />
                {index === fields.length - 1 && (
                  <LinkButton
                    disabled={!field.value.value}
                    iconComponent={IcoPlusSmall16}
                    iconPosition="left"
                    onClick={() => append({ label: '', value: undefined })}
                    size="compact"
                    testID="add-citizenship-button"
                  >
                    {t('citizenship.add-text')}
                  </LinkButton>
                )}
              </>
            );
          }}
        />
      ))}
    </>
  );
};

export default CountryFields;
