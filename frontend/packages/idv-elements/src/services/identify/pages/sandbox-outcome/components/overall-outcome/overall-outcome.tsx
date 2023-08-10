import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocOutcomes, OverallOutcomes } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import OutcomeSelect from '../outcome-select';

const OverallOutcome = () => {
  const { t } = useTranslation('pages.sandbox-outcome.overall-outcome');
  const { control, watch, setValue } = useFormContext();
  const watchIdDocOutcome = watch('outcomes.idDocOutcome');
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (watchIdDocOutcome === IdDocOutcomes.fail) {
      setValue('outcomes.overallOutcome', OverallOutcomes.fail);
      setHint(t('hint.id-doc-fail'));
      return;
    }
    if (watchIdDocOutcome === IdDocOutcomes.real) {
      setValue('outcomes.overallOutcome', OverallOutcomes.documentDecision);
      setHint(t('hint.id-doc-real'));
      return;
    }
    setHint('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, watchIdDocOutcome]);

  return (
    <Container>
      <Typography variant="label-3">{t('title')}</Typography>
      <Controller
        control={control}
        name="outcomes.overallOutcome"
        render={({ field }) => (
          <Box>
            <OutcomeSelect
              options={[
                {
                  title: t('outcome.options.success.title'),
                  value: OverallOutcomes.success,
                },
                {
                  title: t('outcome.options.manual-review.title'),
                  value: OverallOutcomes.manualReview,
                },
                {
                  title: t('outcome.options.fail.title'),
                  value: OverallOutcomes.fail,
                },
              ]}
              value={field.value}
              onChange={field.onChange}
              testID="overallOutcomeOption"
              disabled={
                watchIdDocOutcome === IdDocOutcomes.fail ||
                watchIdDocOutcome === IdDocOutcomes.real
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

export default OverallOutcome;
