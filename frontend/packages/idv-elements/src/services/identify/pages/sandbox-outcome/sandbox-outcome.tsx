import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCheck24,
  IcoClose24,
  IcoPencil24,
  IcoUser24,
  IcoWarning24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  CopyButton,
  IconButton,
  RadioSelect,
  TextInput,
  Tooltip,
  Typography,
} from '@onefootprint/ui';
import Hint from '@onefootprint/ui/src/components/internal/hint';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
import useSkipIfHasBootstrapData from './hooks/use-skip-if-has-bootstrap-data';
import getRandomID from './utils/get-random-id';
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
  const parsedId = parseTestID(bootstrapData?.email);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      outcome: Outcomes.success,
      testID: parsedId || getRandomID(),
    },
    mode: 'onChange',
  });
  const [idInputLocked, setIdInputLocked] = useState(true);

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
    if (idInputLocked) return '';
    return t('test-id.hint');
  };

  const handleSaveOrEdit = () => setIdInputLocked(prev => !prev);

  const handleReset = () => {
    resetField('testID');
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
        <InputContainer>
          <InputTitle>
            <Typography variant="label-3">{t('test-id.label')}</Typography>
            <Typography variant="body-3" color="secondary">
              {t('test-id.description')}
            </Typography>
          </InputTitle>
          <InputControls>
            <Box sx={{ width: '100%' }}>
              <TextInput
                hasError={!!errors.testID}
                placeholder={t('test-id.placeholder')}
                sx={{
                  color: idInputLocked ? 'quaternary' : 'primary',
                }}
                disabled={idInputLocked}
                {...register('testID', {
                  required: {
                    value: true,
                    message: t('test-id.errors.required'),
                  },
                  // Must not contain special characters
                  pattern: {
                    value: /^[A-Za-z0-9]+$/,
                    message: t('test-id.errors.invalid'),
                  },
                })}
              />
            </Box>
            {idInputLocked ? (
              <>
                <CopyButton
                  contentToCopy={getValues('testID')}
                  tooltipText={t('test-id.button.copy')}
                  tooltipPosition="top"
                  tooltipTextConfirmation={t(
                    'test-id.button.copy-confirmation',
                  )}
                />
                <Tooltip text={t('test-id.button.edit')}>
                  <IconButton
                    aria-label={t('test-id.button.edit')}
                    onClick={handleSaveOrEdit}
                  >
                    <IcoPencil24 />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip text={t('test-id.button.save')}>
                  <IconButton
                    aria-label={t('test-id.button.save')}
                    onClick={handleSaveOrEdit}
                    disabled={!!errors?.testID}
                  >
                    <IcoCheck24
                      color={errors?.testID ? 'primary' : 'success'}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip text={t('test-id.button.reset')}>
                  <IconButton
                    aria-label={t('test-id.button.reset')}
                    onClick={handleReset}
                  >
                    <IcoClose24 color="error" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </InputControls>
          <Hint hasError={!!errors?.testID}>{getHint()}</Hint>
        </InputContainer>
        <Button fullWidth type="submit" disabled={!!errors?.testID}>
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

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputControls = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

const InputTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default SandboxOutcome;
