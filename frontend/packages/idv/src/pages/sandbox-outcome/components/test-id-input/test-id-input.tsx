import { IcoCheck24, IcoClose24, IcoCopy24, IcoInfo16, IcoPencil24 } from '@onefootprint/icons';
import { Box, CopyButton, Hint, Text, TextInput, Tooltip } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import InlineButton from './components/inline-button';
import InlineButtonsLayout from './components/inline-buttons-layout';

const TestIdInput = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome',
  });
  const [idInputLocked, setIdInputLocked] = useState(true);
  const {
    register,
    formState: { errors },
    resetField,
    getValues,
  } = useFormContext();
  const getHint = () => {
    if (errors?.testID?.type === 'required') {
      return t('test-id.errors.required');
    }
    if (errors?.testID) {
      return t('test-id.errors.invalid');
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
        <Text variant="label-2">{t('test-id.label')}</Text>
        <Tooltip text={t('test-id.description')} alignment="start" position="top">
          <IcoInfo16 testID="infoIcon" />
        </Tooltip>
      </InputTitle>
      <InputControls>
        <Box width="100%">
          <TextInput
            hasError={!!errors.testID}
            placeholder={t('test-id.placeholder')}
            testID="test-id-input"
            sx={{
              color: idInputLocked ? 'quaternary' : 'primary',
            }}
            disabled={idInputLocked}
            {...register('testID', {
              required: {
                value: true,
                message: t('test-id.errors.required'),
              },
              // Must not contain special characters
              pattern: {
                value: /^[A-Za-z0-9]+$/,
                message: t('test-id.errors.invalid'),
              },
            })}
          />
        </Box>
        {idInputLocked ? (
          <InlineButtonsLayout>
            <CopyButton
              ariaLabel={t('test-id.button.copy')}
              contentToCopy={getValues('testID')}
              tooltipText={t('test-id.button.copy')}
              tooltipPosition="top"
              tooltipTextConfirmation={t('test-id.button.copy-confirmation')}
            >
              <InlineButton icon={IcoCopy24} />
            </CopyButton>
            <InlineButton
              ariaLabel={t('test-id.button.edit')}
              onClick={handleSaveOrEdit}
              tooltipText={t('test-id.button.edit')}
              icon={IcoPencil24}
            />
          </InlineButtonsLayout>
        ) : (
          <InlineButtonsLayout>
            <InlineButton
              ariaLabel={t('test-id.button.save')}
              onClick={handleSaveOrEdit}
              tooltipText={t('test-id.button.save')}
              icon={IcoCheck24}
              disabled={!!errors?.testID}
            />
            <InlineButton
              ariaLabel={t('test-id.button.reset')}
              onClick={handleReset}
              tooltipText={t('test-id.button.reset')}
              icon={IcoClose24}
            />
          </InlineButtonsLayout>
        )}
      </InputControls>
      <Hint hasError={!!errors?.testID}>{getHint()}</Hint>
    </InputContainer>
  );
};

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputControls = styled.div`
  display: flex;
  align-items: center;
`;

const InputTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[4]};
  `}
`;

export default TestIdInput;
