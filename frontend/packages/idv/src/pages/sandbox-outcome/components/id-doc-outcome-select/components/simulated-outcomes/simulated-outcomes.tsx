import { Box, NativeSelect, Stack, Text } from '@onefootprint/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { IcoWarning16 } from '@onefootprint/icons';
import { IdDocOutcome } from '@onefootprint/types';
import useSandboxOutcomeOptions from '../../../../hooks/use-sandbox-outcome-options';
import { SandboxOutcomeFormData } from '../../../../types';

const SimulatedOutcomes = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome.id-doc-outcome.simulated-outcome',
  });
  const {
    idDocOutcomeOptions: {
      simulatedOutcomeOptions: { idDocOutcomeSuccess, idDocOutcomeFail },
    },
  } = useSandboxOutcomeOptions();
  const { register } = useFormContext();

  const options = [idDocOutcomeSuccess, idDocOutcomeFail];

  const watchIdDocOutcome = useWatch<SandboxOutcomeFormData, 'idDocOutcome'>({
    name: 'idDocOutcome',
  });

  return (
    <Stack flexDirection="column" gap={5}>
      <Text variant="body-4" color="tertiary">
        {t('description')}
      </Text>
      <Box
        backgroundColor="secondary"
        padding={3}
        paddingLeft={4}
        borderStyle="solid"
        borderRadius="default"
        borderColor="tertiary"
      >
        <Stack alignItems="center" justifyContent="space-between">
          <label htmlFor="idDocOutcome">
            <Text variant="label-4" color="primary">
              {t('label')}
            </Text>
          </label>
          <NativeSelect {...register('idDocOutcome')} name="idDocOutcome" id="idDocOutcome">
            {options.map(({ value, label }) => (
              <option key={value} value={value} aria-selected={watchIdDocOutcome === value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Stack>
      </Box>
      {watchIdDocOutcome === IdDocOutcome.fail && (
        <Stack gap={2} alignItems="end">
          <Box>
            <IcoWarning16 color="warning" />
          </Box>
          <Text variant="body-4" color="warning">
            {t('options.fail.description')}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};

export default SimulatedOutcomes;
