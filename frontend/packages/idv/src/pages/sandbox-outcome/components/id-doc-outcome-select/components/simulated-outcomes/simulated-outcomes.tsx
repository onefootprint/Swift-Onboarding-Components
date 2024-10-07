import { Box, Form, Stack, Text } from '@onefootprint/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { IcoWarning16 } from '@onefootprint/icons';
import { IdDocOutcome } from '@onefootprint/types';
import useSandboxOutcomeOptions from '../../../../hooks/use-sandbox-outcome-options';
import type { SandboxOutcomeFormData } from '../../../../types';

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
      <Text variant="body-3" color="tertiary">
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
          <Form.Field>
            <Form.Label htmlFor="idDocOutcome">
              <Text variant="label-3" color="primary">
                {t('label')}
              </Text>
            </Form.Label>
            <Form.Select {...register('idDocOutcome')} id="idDocOutcome" size="compact">
              {options.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Form.Select>
          </Form.Field>
        </Stack>
      </Box>
      {watchIdDocOutcome === IdDocOutcome.fail && (
        <Stack gap={2} alignItems="end">
          <Box>
            <IcoWarning16 color="warning" />
          </Box>
          <Text variant="body-3" color="warning">
            {t('options.fail.description')}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};

export default SimulatedOutcomes;
