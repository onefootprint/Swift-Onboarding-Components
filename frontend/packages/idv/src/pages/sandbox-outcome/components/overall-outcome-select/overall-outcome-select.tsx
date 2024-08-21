import { IdVerificationOutcome, type PublicOnboardingConfig } from '@onefootprint/types';
import { IdDocOutcome, OverallOutcome } from '@onefootprint/types';
import { NativeSelect, Stack, Text } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSandboxOutcomeOptions from '../../hooks/use-sandbox-outcome-options';
import type { SandboxOutcomeFormData } from '../../types';

type OverallOutcomeSelectProps = {
  config?: PublicOnboardingConfig;
};

const OverallOutcomeSelect = ({ config }: OverallOutcomeSelectProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome.overall-outcome',
  });
  const {
    overallOutcomeOptions: {
      overallOutcomeSuccess,
      overallOutcomeFail,
      overallOutcomeManualReview,
      overallOutcomeStepUp,
      overallOutcomeDocumentDecision,
    },
    idDocOutcomeOptions: {
      simulatedOutcomeOptions: { idDocOutcomeSuccess },
    },
  } = useSandboxOutcomeOptions();

  const { setValue, register } = useFormContext<SandboxOutcomeFormData>();
  const watchIdDocOutcome = useWatch<SandboxOutcomeFormData, 'idDocOutcome'>({
    name: 'idDocOutcome',
  });
  const watchDocVerificationOutcome = useWatch<SandboxOutcomeFormData, 'docVerificationOutcome'>({
    name: 'docVerificationOutcome',
  });
  const watchOverallOutcome = useWatch<SandboxOutcomeFormData, 'overallOutcome'>({ name: 'overallOutcome' });
  const requiresIdDoc = !!config?.requiresIdDoc;
  const shouldShowStepUp = !!config?.isStepupEnabled;

  const options: { label: string; value: string; description?: string }[] = [
    overallOutcomeSuccess,
    overallOutcomeFail,
    overallOutcomeManualReview,
  ];
  if (shouldShowStepUp) options.push(overallOutcomeStepUp);

  useEffect(() => {
    // We change the overall outcome selection to fail if id-doc outcome is selected to be fail
    // However, if we are showing id-doc outcome because step-up was selected for overall outcome, we keep the overall outcome selection as step-up
    if (watchIdDocOutcome === IdDocOutcome.fail && watchOverallOutcome !== OverallOutcome.stepUp) {
      setValue('overallOutcome', overallOutcomeFail.value);
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchIdDocOutcome]);

  useEffect(() => {
    // We change the overall outcome selection to document-decision if id-doc outcome is selected to be real
    // However, if we are showing id-doc outcome because step-up was selected for overall outcome, we keep the overall outcome selection as step-up
    if (watchDocVerificationOutcome === IdVerificationOutcome.real && watchOverallOutcome !== OverallOutcome.stepUp) {
      setValue('overallOutcome', overallOutcomeDocumentDecision.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchDocVerificationOutcome]);

  useEffect(() => {
    // This piece of code handles the case when id-doc selector shows up on step up select
    // We don't do it (show id doc on step up select) yet since BE isn't ready
    // TODO: update the comment when it's fully implemented
    if (watchOverallOutcome === OverallOutcome.stepUp) {
      if (watchIdDocOutcome === undefined) setValue('idDocOutcome', idDocOutcomeSuccess.value);
    } else if (!requiresIdDoc) setValue('idDocOutcome', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchIdDocOutcome, watchOverallOutcome]);

  const isDisabled =
    watchIdDocOutcome === IdDocOutcome.fail || watchDocVerificationOutcome === IdVerificationOutcome.real;

  return (
    <Stack flexDirection="column" gap={5}>
      <Stack alignItems="center" justifyContent="space-between">
        <label htmlFor="overallOutcome">
          <Text variant="label-4" color="primary">
            {t('title')}
          </Text>
        </label>
        <NativeSelect size="compact" disabled={isDisabled} {...register('overallOutcome')} id="overallOutcome">
          {options.map(({ value, label }) => (
            <option key={value} value={value} aria-selected={watchOverallOutcome === value}>
              {label}
            </option>
          ))}
          {isDisabled && (
            <option value={OverallOutcome.useRulesOutcome} aria-selected={true}>
              -
            </option>
          )}
        </NativeSelect>
      </Stack>
      {watchOverallOutcome === OverallOutcome.stepUp && (
        <Text variant="body-4" color="tertiary">
          {overallOutcomeStepUp.description}
        </Text>
      )}
    </Stack>
  );
};

export default OverallOutcomeSelect;
