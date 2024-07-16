import { Box, TextInput } from '@onefootprint/ui';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';
import type { TextInput as RNTextInput } from 'react-native';

import useTranslation from '@/hooks/use-translation';

import type { FormData } from '../../types';

type CityInputProps = {
  control: Control<FormData, unknown>;
  currInputRef: React.RefObject<RNTextInput>;
  nextInputRef: React.RefObject<RNTextInput>;
};

const CityInput = ({ control, currInputRef, nextInputRef }: CityInputProps) => {
  const { t } = useTranslation('pages.residential-address');

  return (
    <Box flex={1}>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          return (
            <TextInput
              autoComplete="address-line1"
              blurOnSubmit={false}
              returnKeyType="next"
              hasError={!!error}
              hint={error?.message}
              inputMode="text"
              label={t('form.city.label')}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={() => nextInputRef.current?.focus()}
              placeholder={t('form.city.placeholder')}
              private
              ref={currInputRef}
              textContentType="addressCity"
              value={value}
            />
          );
        }}
        name="city"
      />
    </Box>
  );
};

export default CityInput;
