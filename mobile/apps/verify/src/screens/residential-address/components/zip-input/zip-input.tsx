import type { SelectRef } from '@onefootprint/ui';
import { Box, TextInput } from '@onefootprint/ui';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';
import type { TextInput as RNTextInput } from 'react-native';

import useTranslation from '@/hooks/use-translation';

import type { FormData } from '../../types';

type ZipInputProps = {
  control: Control<FormData, unknown>;
  currInputRef: React.RefObject<RNTextInput>;
  nextInputRef: React.RefObject<SelectRef | RNTextInput>;
};

const ZipInput = ({ control, currInputRef, nextInputRef }: ZipInputProps) => {
  const { t } = useTranslation('pages.residential-address');

  return (
    <Box flex={1}>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          return (
            <TextInput
              autoComplete="postal-code"
              blurOnSubmit
              returnKeyType="next"
              hasError={!!error}
              hint={error?.message}
              inputMode="text"
              label={t('form.zip.label')}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={() => {
                nextInputRef.current?.focus();
              }}
              placeholder={t('form.zip.placeholder')}
              private
              ref={currInputRef}
              textContentType="postalCode"
              value={value}
            />
          );
        }}
        name="zip"
      />
    </Box>
  );
};

export default ZipInput;
