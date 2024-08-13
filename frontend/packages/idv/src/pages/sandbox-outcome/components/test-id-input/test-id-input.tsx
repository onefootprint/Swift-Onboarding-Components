import { IcoCheck16, IcoClose16, IcoCopy16, IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
import { CopyButton, Hint, Stack, Text, TextInput, Tooltip } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import InlineButton from './components/inline-button';

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
    <Stack flexDirection="column" justifyContent="flex-end">
      <Stack justifyContent="space-between">
        <Stack gap={2} alignItems="center">
          <label htmlFor="testID">
            <Text variant="label-4">{t('test-id.label')}</Text>
          </label>
          <Tooltip text={t('test-id.description')} alignment="start" position="top">
            <IcoInfo16 testID="infoIcon" />
          </Tooltip>
        </Stack>
        <Stack gap={4}>
          <TextInput
            id="testID"
            hasError={!!errors.testID}
            placeholder={t('test-id.placeholder')}
            testID="test-id-input"
            size="compact"
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
          {idInputLocked ? (
            <Stack gap={4}>
              <CopyButton
                ariaLabel={t('test-id.button.copy')}
                contentToCopy={getValues('testID')}
                tooltipText={t('test-id.button.copy')}
                tooltipPosition="top"
                tooltipTextConfirmation={t('test-id.button.copy-confirmation')}
              >
                <InlineButton icon={IcoCopy16} />
              </CopyButton>
              <InlineButton
                ariaLabel={t('test-id.button.edit')}
                onClick={handleSaveOrEdit}
                tooltipText={t('test-id.button.edit')}
                icon={IcoPencil16}
              />
            </Stack>
          ) : (
            <Stack gap={3}>
              <InlineButton
                ariaLabel={t('test-id.button.save')}
                onClick={handleSaveOrEdit}
                tooltipText={t('test-id.button.save')}
                icon={IcoCheck16}
                disabled={!!errors?.testID}
              />
              <InlineButton
                ariaLabel={t('test-id.button.reset')}
                onClick={handleReset}
                tooltipText={t('test-id.button.reset')}
                icon={IcoClose16}
              />
            </Stack>
          )}
        </Stack>
      </Stack>
      <Hint hasError={!!errors?.testID}>{getHint()}</Hint>
    </Stack>
  );
};

export default TestIdInput;
