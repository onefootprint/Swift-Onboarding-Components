import { IcoCheck24, IcoClose24, IcoPencil24 } from '@onefootprint/icons';
import { Box, Hint, TextInput, Typography } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { TextInput as RNTextInput } from 'react-native';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

import CopyButton from '../copy-button/copy-button';
import InlineButton from '../inline-button';
import InlineButtonsLayout from '../inline-buttons-layout';

const TestIdInput = () => {
  const { t } = useTranslation('pages.sandbox-outcome');
  const { control } = useFormContext();
  const [idInputLocked, setIdInputLocked] = useState(true);
  const testIdInputRef = useRef<RNTextInput>(null);
  const {
    formState: { errors },
    resetField,
    getValues,
  } = useFormContext();
  const getHint = () => {
    if (errors?.testID) {
      return errors.testID.message?.toString() || t('test-id.errors.invalid');
    }
    if (idInputLocked) return '';
    return t('test-id.hint');
  };

  const handleSaveOrEdit = () => setIdInputLocked(prev => !prev);

  const handleReset = () => {
    resetField('testID');
    handleSaveOrEdit();
  };

  return (
    <InputContainer>
      <InputTitle>
        <Typography variant="label-2">{t('test-id.label')}</Typography>
      </InputTitle>
      <InputControls>
        <Box flex={3}>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => {
              return (
                <TextInput
                  autoComplete="name-given"
                  autoCorrect={false}
                  blurOnSubmit={false}
                  inputMode="text"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  ref={testIdInputRef}
                  onSubmitEditing={() => testIdInputRef.current?.focus()}
                  value={value}
                  hasError={!!errors.testID}
                  placeholder={t('test-id.placeholder')}
                  disabled={idInputLocked}
                  autoCapitalize="none"
                />
              );
            }}
            name="testID"
          />
        </Box>
        <Box flex={1}>
          {idInputLocked ? (
            <InlineButtonsLayout>
              <CopyButton text={getValues('testID')} />
              <InlineButton ariaLabel={t('test-id.button.edit')} onClick={handleSaveOrEdit} icon={IcoPencil24} />
            </InlineButtonsLayout>
          ) : (
            <InlineButtonsLayout>
              <InlineButton
                ariaLabel={t('test-id.button.save')}
                onClick={handleSaveOrEdit}
                icon={IcoCheck24}
                disabled={!!errors?.testID}
              />
              <InlineButton ariaLabel={t('test-id.button.reset')} onClick={handleReset} icon={IcoClose24} />
            </InlineButtonsLayout>
          )}
        </Box>
      </InputControls>
      <Hint hasError={!!errors?.testID}>{getHint()}</Hint>
    </InputContainer>
  );
};

const InputContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

const InputControls = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const InputTitle = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default TestIdInput;
