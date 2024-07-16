import { zodResolver } from '@hookform/resolvers/zod';
import type { OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components/native';
import { z } from 'zod';

import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

import OverallOutcomeSelect from './components/overall-outcome-select';
import TestIdInput from './components/test-id-input';
import useSandboxOutcomeOptions from './hooks/use-sandbox-outcome-options';
import type { SandboxOutcomeFormData } from './types';
import getRandomId from './utils/get-random-id';

type SandboxOutcomeProps = {
  onSubmit: (outcome: {
    overallOutcome: OverallOutcome;
    sandboxId: string;
  }) => void;
  config?: PublicOnboardingConfig;
  onIdDocRequirement: () => void;
};

export const SandboxOutcome = ({ onSubmit, config, onIdDocRequirement }: SandboxOutcomeProps) => {
  const { t } = useTranslation('pages.sandbox-outcome');
  const {
    overallOutcomeOptions: { overallOutcomeSuccess },
  } = useSandboxOutcomeOptions();
  const requiresIdDoc = !!config?.requiresIdDoc;

  const schema = z.object({
    testID: z
      .string()
      .min(1, { message: t('test-id.errors.required') })
      .regex(/^[A-Za-z0-9]+$/, { message: t('test-id.errors.invalid') }),
  });

  const formMethods = useForm<SandboxOutcomeFormData>({
    defaultValues: {
      outcomes: {
        overallOutcome: overallOutcomeSuccess,
      },
      testID: getRandomId(),
    },
    mode: 'onChange',
    resolver: zodResolver(schema),
  });
  const {
    formState: { errors },
    getValues,
  } = formMethods;

  // TODO: Remove this when we start supporting id-doc
  if (requiresIdDoc) {
    onIdDocRequirement();
    return null;
  }

  const handleOutcomeSubmit = () => {
    const data = getValues();
    const payload = {
      overallOutcome: data.outcomes.overallOutcome.value,
      sandboxId: data.testID,
    };
    onSubmit(payload);
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <FormProvider {...formMethods}>
        <Form>
          <OptionsContainer>
            <OverallOutcomeSelect />
            <TestIdInput />
          </OptionsContainer>
          <Button disabled={!!errors?.testID} onPress={handleOutcomeSubmit}>
            {t('cta')}
          </Button>
        </Form>
      </FormProvider>
    </Container>
  );
};

const Container = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding-top: ${theme.spacing[3]};
  `}
`;

const Form = styled.View`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
    gap: ${theme.spacing[7]};
  `}
`;

const OptionsContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    padding-top: ${theme.spacing[3]};
  `}
`;

export default SandboxOutcome;
