import { STATES } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { AddressInput, TextInput } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import getAddressComponent from './utils/get-address-components';

type AddressLinesProps = {
  countryCode: CountryCode;
};

const AddressLines = ({ countryCode }: AddressLinesProps) => {
  const {
    register,
    formState: { errors },
    setValue,
    resetField,
  } = useFormContext();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.address.form',
  });

  const handleAddressSelect = async (prediction?: google.maps.places.AutocompletePrediction | null) => {
    if (!prediction) {
      return;
    }

    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');

    const formattedStreetAddress = prediction?.structured_formatting.main_text;
    if (formattedStreetAddress) {
      setValue('addressLine1', formattedStreetAddress);
    }

    const result = await getAddressComponent(prediction);
    if (result) {
      if (result.city) {
        setValue('city', result.city);
      }
      if (result.state) {
        if (countryCode === 'US') {
          const possibleState = STATES.find(stateOption => stateOption.label === result.state);
          if (possibleState) {
            setValue('state', possibleState);
          }
        } else {
          setValue('state', result.state);
        }
      }
      if (result.zip) {
        setValue('zip', result.zip);
      }
    }
  };

  return (
    <>
      <AddressInput
        data-dd-privacy="mask"
        country={countryCode}
        hasError={!!errors.addressLine1}
        hint={errors.addressLine1 && t('address-line-1.error')}
        label={t('address-line-1.label')}
        onSelect={handleAddressSelect}
        placeholder={t('address-line-1.placeholder')}
        {...register('addressLine1', {
          required: true,
          pattern: /^(?!p\.?o\.?\s?box).*$/i,
        })}
      />
      <TextInput
        data-dd-privacy="mask"
        autoComplete="address-line2"
        label={t('address-line-2.label')}
        placeholder={t('address-line-2.placeholder')}
        {...register('addressLine2')}
      />
    </>
  );
};

export default AddressLines;
