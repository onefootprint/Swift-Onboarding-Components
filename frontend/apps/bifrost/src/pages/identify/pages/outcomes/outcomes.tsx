import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoUser24, IcoWarning24 } from '@onefootprint/icons';
import { Box, Button, RadioSelect, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

type FormData = {
  testID: string;
  outcome: 'success' | 'manualreview' | 'fail';
};

// TODO:
// Inject to the state machine and continue

const Outcomes = () => {
  const { t } = useTranslation('pages.outcomes');
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      outcome: 'success',
    },
  });

  const handleAfterSubmit = (formData: FormData) => {
    console.log(formData);
  };

  return (
    <Box>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Form onSubmit={handleSubmit(handleAfterSubmit)}>
        <Controller
          control={control}
          name="outcome"
          rules={{ required: true }}
          render={({ field }) => (
            <RadioSelect
              options={[
                {
                  title: t('outcome.options.success.title'),
                  description: t('outcome.options.success.description'),
                  value: 'success',
                  IconComponent: IcoCheck24,
                },
                {
                  title: t('outcome.options.manual-review.title'),
                  description: t('outcome.options.manual-review.description'),
                  value: 'manualreview',
                  IconComponent: IcoUser24,
                },
                {
                  title: t('outcome.options.fail.title'),
                  description: t('outcome.options.fail.description'),
                  value: 'fail',
                  IconComponent: IcoWarning24,
                },
              ]}
              value={field.value}
              onSelect={field.onChange}
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

export default Outcomes;
