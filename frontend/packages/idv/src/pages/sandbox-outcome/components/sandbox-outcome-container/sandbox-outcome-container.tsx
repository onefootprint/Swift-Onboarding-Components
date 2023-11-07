import { useTranslation } from '@onefootprint/hooks';
import {
  getRandomID,
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/idv-elements';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDocOutcome } from '@onefootprint/types';
import { Button, Grid, InlineAlert, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useSandboxOutcomeOptions from '../../hooks/use-sandbox-outcome-options';
import type { SandboxOutcomeFormData } from '../../types';
import IdDocOutcomeSelect from '../id-doc-outcome-select';
import OverallOutcomeSelect from '../overall-outcome-select';
import TestIdInput from '../test-id-input';

export const SandboxOutcomeContainer = ({
  onSubmit,
  config,
}: {
  onSubmit: (formData: SandboxOutcomeFormData) => void;
  config?: PublicOnboardingConfig;
}) => {
  const { t } = useTranslation('pages.sandbox-outcome');
  const {
    overallOutcomeOptions: { overallOutcomeSuccess },
  } = useSandboxOutcomeOptions();
  const requiresIdDoc = !!config?.requiresIdDoc;
  const shouldShowIdDocOutcome = requiresIdDoc;

  const formMethods = useForm<SandboxOutcomeFormData>({
    defaultValues: {
      outcomes: {
        overallOutcome: overallOutcomeSuccess,
        idDocOutcome: shouldShowIdDocOutcome
          ? {
              label: t(
                'id-doc-outcome.simulated-outcome.options.success.title',
              ),
              value: IdDocOutcome.success,
            }
          : undefined,
      },
      testID: getRandomID(),
    },
    mode: 'onChange',
  });
  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = formMethods;
  const watchIdDocOutcome = watch('outcomes.idDocOutcome');

  return (
    <Container>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <FormProvider {...formMethods}>
        <Form as="form" onSubmit={handleSubmit(onSubmit)}>
          <OptionsContainer>
            <OverallOutcomeSelect config={config} />
            {shouldShowIdDocOutcome && (
              <IdDocOutcomeSelect
                allowRealOutcome={config?.canMakeRealDocScanCallsInSandbox}
              />
            )}
            {watchIdDocOutcome?.value === IdDocOutcome.real && (
              <InlineAlert variant="info">
                <Typography variant="body-3" color="info">
                  {t('id-doc-outcome.real-outcome.description')}
                </Typography>
              </InlineAlert>
            )}
            {watchIdDocOutcome?.value === IdDocOutcome.fail && (
              <InlineAlert variant="info">
                <Typography variant="body-3" color="info">
                  {t(
                    'id-doc-outcome.simulated-outcome.options.fail.description',
                  )}
                </Typography>
              </InlineAlert>
            )}
            <TestIdInput />
          </OptionsContainer>
          <Button fullWidth type="submit" disabled={!!errors?.testID}>
            {t('cta')}
          </Button>
        </Form>
      </FormProvider>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding-top: ${theme.spacing[3]};
  `}
`;

const Form = styled(Grid.Container)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
    gap: ${theme.spacing[7]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    padding-top: ${theme.spacing[3]};
  `}
`;

export default SandboxOutcomeContainer;
