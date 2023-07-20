import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoUser24, IcoWarning24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, Button, RadioSelect, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
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
  const [state, send] = useIdentifyMachine();
  const { bootstrapData } = state.context;
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      outcome: Outcomes.success,
      testID: parseTestID(bootstrapData?.email),
    },
  });

  const handleAfterSubmit = (formData: FormData) => {
    send({
      type: 'sandboxOutcomeSubmitted',
      payload: {
        sandboxId: `${formData.outcome}${formData.testID}`,
      },
    });
  };

  const getHint = () => {
    if (errors?.testID?.type === 'required') {
      return t('test-id.errors.required');
    }
    if (errors?.testID) {
      return t('test-id.errors.invalid');
    }
    return t('test-id.hint');
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
          hint={getHint()}
          {...register('testID', {
            required: {
              value: true,
              message: t('test-id.errors.required'),
            },
            // Must not contain special characters
            pattern: {
              value: /^(?!.*\\)[A-Za-z0-9]+$/,
              message: t('test-id.errors.invalid'),
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
