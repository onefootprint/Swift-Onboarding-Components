import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoUser24, IcoWarning24 } from '@onefootprint/icons';
import { Box, Button, RadioSelect, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../components/header-title';
import NavigationHeader from '../../components/layout/components/navigation-header';
import useIdvMachine from '../../hooks/use-idv-machine';
import useSkipIfHasBootstrapData from './hooks/use-skip-if-has-bootstrap-data';
import parseTestID from './utils/parse-suffix';

export enum Outcomes {
  success = '',
  manualReview = 'manualreview',
  fail = 'fail',
}

type FormData = {
  testID: string;
  outcome: Outcomes;
};

const SandboxOutcome = () => {
  const { t } = useTranslation('pages.sandbox-outcome');
  useSkipIfHasBootstrapData();
  const [state, send] = useIdvMachine();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      outcome: Outcomes.success,
      testID: parseTestID(state.context.bootstrapData?.email),
    },
  });

  const handleAfterSubmit = (formData: FormData) => {
    send({
      type: 'sandboxOutcomeSubmitted',
      payload: {
        sandboxSuffix: `#${formData.outcome}${formData.testID}`,
      },
    });
  };

  return (
    <Box>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Form onSubmit={handleSubmit(handleAfterSubmit)}>
        <Controller
          control={control}
          name="outcome"
          render={({ field }) => (
            <RadioSelect
              options={[
                {
                  title: t('outcome.options.success.title'),
                  description: t('outcome.options.success.description'),
                  value: Outcomes.success,
                  IconComponent: IcoCheck24,
                },
                {
                  title: t('outcome.options.manual-review.title'),
                  description: t('outcome.options.manual-review.description'),
                  value: Outcomes.manualReview,
                  IconComponent: IcoUser24,
                },
                {
                  title: t('outcome.options.fail.title'),
                  description: t('outcome.options.fail.description'),
                  value: Outcomes.fail,
                  IconComponent: IcoWarning24,
                },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <TextInput
          hasError={!!errors.testID}
          label={t('test-id.label')}
          placeholder={t('test-id.placeholder')}
          hint={t('test-id.hint')}
          {...register('testID', {
            required: {
              value: true,
              message: t('test-id.errors.required'),
            },
          })}
        />
        <Button fullWidth type="submit">
          {t('cta')}
        </Button>
      </Form>
    </Box>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
    display: grid;
    gap: ${theme.spacing[7]};
  `}
`;

export default SandboxOutcome;
