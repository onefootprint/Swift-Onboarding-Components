import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocOutcome, OverallOutcome } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import OutcomeSelect from '../outcome-select';

type OverallOutcomeSelectProps = {
  shouldShowStepUp: boolean;
  requiresIdDoc: boolean;
  onStepUpSelect: () => void;
  onStepUpDeselect: () => void;
};

const OverallOutcomeSelect = ({
  shouldShowStepUp,
  requiresIdDoc,
  onStepUpSelect,
  onStepUpDeselect,
}: OverallOutcomeSelectProps) => {
  const { t } = useTranslation('pages.sandbox-outcome.overall-outcome');
  const { control, watch, setValue } = useFormContext();
  const watchIdDocOutcome = watch('outcomes.idDocOutcome');
  const watchOverallOutcome = watch('outcomes.overallOutcome');
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (
      watchIdDocOutcome === IdDocOutcome.fail &&
      watchOverallOutcome !== OverallOutcome.stepUp
    ) {
      setValue('outcomes.overallOutcome', OverallOutcome.fail);
      setHint(t('hint.id-doc-fail'));
      return;
    }
    if (
      watchIdDocOutcome === IdDocOutcome.real &&
      watchOverallOutcome !== OverallOutcome.stepUp
    ) {
      setValue('outcomes.overallOutcome', OverallOutcome.documentDecision);
      setHint(t('hint.id-doc-real'));
      return;
    }
    setHint('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchIdDocOutcome]);

  useEffect(() => {
    if (watchOverallOutcome === OverallOutcome.stepUp) {
      onStepUpSelect();
      if (watchIdDocOutcome === undefined)
        setValue('outcomes.idDocOutcome', IdDocOutcome.success);
    } else {
      onStepUpDeselect();
      if (!requiresIdDoc) setValue('outcomes.idDocOutcome', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchIdDocOutcome, watchOverallOutcome]);

  const options = [
    {
      title: t('outcome.options.success.title'),
      value: OverallOutcome.success,
    },
    {
      title: t('outcome.options.manual-review.title'),
      value: OverallOutcome.manualReview,
    },
    {
      title: t('outcome.options.fail.title'),
      value: OverallOutcome.fail,
    },
  ];

  if (shouldShowStepUp) {
    options.push({
      title: t('outcome.options.step-up.title'),
      value: OverallOutcome.stepUp,
    });
  }

  return (
    <Container>
      <Typography variant="label-3">{t('title')}</Typography>
      <Controller
        control={control}
        name="outcomes.overallOutcome"
        render={({ field }) => (
          <Box>
            <OutcomeSelect
              options={options}
              value={field.value}
              onChange={field.onChange}
              testID="overallOutcomeOption"
              disabled={
                watchIdDocOutcome === IdDocOutcome.fail ||
                watchIdDocOutcome === IdDocOutcome.real
              }
            />
            {hint && (
              <Typography
                variant="body-4"
                color="quaternary"
                sx={{ marginTop: 3 }}
              >
                {hint}
              </Typography>
            )}
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
    gap: ${theme.spacing[4]};
  `}
`;

export default OverallOutcomeSelect;
