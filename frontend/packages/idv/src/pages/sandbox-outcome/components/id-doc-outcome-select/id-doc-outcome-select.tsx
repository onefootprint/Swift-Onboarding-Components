import { IdVerificationOutcome } from '@onefootprint/types/src/data/sandbox-outcomes-type';
import { NativeSelect, Stack, Text } from '@onefootprint/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSandboxOutcomeOptions from '../../../sandbox-outcome/hooks/use-sandbox-outcome-options';
import { SandboxOutcomeFormData } from '../../../sandbox-outcome/types';
import SimulatedOutcomes from './components/simulated-outcomes';

type IdDocOutcomeSelectProps = {
  allowRealOutcome?: boolean;
};

const IdDocOutcomeSelect = ({ allowRealOutcome }: IdDocOutcomeSelectProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome.id-doc-outcome',
  });
  const { register } = useFormContext<SandboxOutcomeFormData>();
  const docVerificationOutcome = useWatch<SandboxOutcomeFormData, 'docVerificationOutcome'>({
    name: 'docVerificationOutcome',
  });
  const {
    idDocOutcomeOptions: { idDocOutcomeReal, idDocOutcomeSimulated },
  } = useSandboxOutcomeOptions();
  const options = [idDocOutcomeReal, idDocOutcomeSimulated];

  return (
    <Stack
      flexDirection="column"
      gap={5}
      borderStyle="dashed"
      borderBottomWidth={1}
      paddingBottom={5}
      borderColor="tertiary"
    >
      <Stack justifyContent="space-between" alignItems="center">
        <label htmlFor="docVerificationOutcome">
          <Text variant="label-4" color="primary">
            {t('title')}
          </Text>
        </label>
        {allowRealOutcome ? (
          <NativeSelect {...register('docVerificationOutcome')} id="docVerificationOutcome" size="compact">
            {options.map(({ value, label }) => (
              <option key={value} value={value} aria-selected={docVerificationOutcome === value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        ) : (
          <Text variant="label-2">{idDocOutcomeSimulated.label}</Text>
        )}
      </Stack>
      {docVerificationOutcome === IdVerificationOutcome.real ? (
        <Text variant="body-4" color="tertiary">
          {t('real-outcome.description')}
        </Text>
      ) : (
        <SimulatedOutcomes />
      )}
    </Stack>
  );
};

export default IdDocOutcomeSelect;
