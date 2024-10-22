import { IcoCheck16, IcoClose16, IcoPencil16 } from '@onefootprint/icons';
import { CopyButton, Hint, IconButton, Stack, Text, TextInput, Tooltip } from '@onefootprint/ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
    if (idInputLocked) {
      return t('test-id.description');
    }
    return t('test-id.hint');
  };

  const handleSaveOrEdit = () => setIdInputLocked(prev => !prev);

  const handleReset = () => {
    resetField('testID');
    handleSaveOrEdit();
  };

  return (
    <Stack
      flexDirection="column"
      justifyContent="flex-end"
      borderStyle="dashed"
      borderTopWidth={1}
      paddingTop={5}
      borderColor="tertiary"
      gap={3}
    >
      <Stack justifyContent="space-between" alignItems="center">
        <label htmlFor="testID">
          <Text variant="label-3">{t('test-id.label')}</Text>
        </label>
        <Stack gap={3}>
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
                value: /^[A-Za-z0-9_]+$/,
                message: t('test-id.errors.invalid'),
              },
            })}
          />
          {idInputLocked ? (
            <Stack>
              <CopyButton
                size="compact"
                ariaLabel={t('test-id.button.copy')}
                contentToCopy={getValues('testID')}
                tooltip={{
                  position: 'top',
                  text: t('test-id.button.copy'),
                  textConfirmation: t('test-id.button.copy-confirmation'),
                }}
              />
              <Tooltip text={t('test-id.button.edit')}>
                <IconButton aria-label={t('test-id.button.edit')} onClick={handleSaveOrEdit} size="compact">
                  <IcoPencil16 />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Stack>
              <Tooltip text={t('test-id.button.save')}>
                <IconButton
                  aria-label={t('test-id.button.save')}
                  onClick={handleSaveOrEdit}
                  disabled={!!errors?.testID}
                >
                  <IcoCheck16 />
                </IconButton>
              </Tooltip>
              <Tooltip text={t('test-id.button.reset')}>
                <IconButton aria-label={t('test-id.button.reset')} onClick={handleReset} size="compact">
                  <IcoClose16 />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </Stack>
      <Hint hasError={!!errors?.testID}>{getHint()}</Hint>
    </Stack>
  );
};

export default TestIdInput;
