import { IcoCheck16, IcoClose16, IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
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
      <Stack justifyContent="space-between" alignItems="center">
        <label htmlFor="testID">
          <Stack gap={2}>
            <Text variant="label-4">{t('test-id.label')}</Text>
            <Tooltip text={t('test-id.description')} alignment="start" position="top">
              <IcoInfo16 testID="infoIcon" />
            </Tooltip>
          </Stack>
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
                value: /^[A-Za-z0-9]+$/,
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
                tooltipText={t('test-id.button.copy')}
                tooltipPosition="top"
                tooltipTextConfirmation={t('test-id.button.copy-confirmation')}
              />
              <Tooltip text={t('test-id.button.edit')}>
                <IconButton aria-label={t('test-id.button.edit')} onClick={handleSaveOrEdit}>
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
                <IconButton aria-label={t('test-id.button.reset')} onClick={handleReset}>
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
