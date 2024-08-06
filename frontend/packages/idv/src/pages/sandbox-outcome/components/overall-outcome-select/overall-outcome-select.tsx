import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDocOutcome, OverallOutcome } from '@onefootprint/types';
import { Box, Select, Text } from '@onefootprint/ui';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useSandboxOutcomeOptions from '../../hooks/use-sandbox-outcome-options';

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

  const { control, watch, setValue } = useFormContext();
  const watchIdDocOutcome = watch('outcomes.idDocOutcome');
  const watchOverallOutcome = watch('outcomes.overallOutcome');
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
    if (watchIdDocOutcome?.value === IdDocOutcome.fail && watchOverallOutcome.value !== OverallOutcome.stepUp) {
      setValue('outcomes.overallOutcome', overallOutcomeFail);
      return;
    }
    // We change the overall outcome selection to document-decision if id-doc outcome is selected to be real
    // However, if we are showing id-doc outcome because step-up was selected for overall outcome, we keep the overall outcome selection as step-up
    if (watchIdDocOutcome?.value === IdDocOutcome.real && watchOverallOutcome.value !== OverallOutcome.stepUp) {
      setValue('outcomes.overallOutcome', overallOutcomeDocumentDecision);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchIdDocOutcome]);

  useEffect(() => {
    // This piece of code handles the case when id-doc selector shows up on step up select
    // We don't do it (show id doc on step up select) yet since BE isn't ready
    // TODO: update the comment when it's fully implemented
    if (watchOverallOutcome.value === OverallOutcome.stepUp) {
      if (watchIdDocOutcome?.value === undefined) setValue('outcomes.idDocOutcome', idDocOutcomeSuccess);
    } else if (!requiresIdDoc) setValue('outcomes.idDocOutcome', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchIdDocOutcome, watchOverallOutcome]);

  const getOption = (value: OverallOutcome) => options.find(option => option.value === value);

  const isDisabled = watchIdDocOutcome?.value === IdDocOutcome.fail || watchIdDocOutcome?.value === IdDocOutcome.real;

  return (
    <Container>
      <Text variant="label-2">{t('title')}</Text>
      <Controller
        control={control}
        name="outcomes.overallOutcome"
        render={({ field }) => (
          <Box>
            <Select
              options={options}
              value={getOption(field.value.value)}
              onChange={field.onChange}
              testID="overallOutcomeOption"
              disabled={isDisabled}
              placeholder="-"
            />
          </Box>
        )}
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing[3]};
  `}
`;

export default OverallOutcomeSelect;
