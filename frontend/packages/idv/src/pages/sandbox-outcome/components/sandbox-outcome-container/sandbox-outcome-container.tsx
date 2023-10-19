import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDocOutcome, OverallOutcome } from '@onefootprint/types';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { SandboxOutcomeFormData } from '../../types';
import getRandomID from '../../utils/get-random-id';
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
  const shouldShowIdDocOutcome = config?.requiresIdDoc;
  const formMethods = useForm<SandboxOutcomeFormData>({
    defaultValues: {
      outcomes: {
        overallOutcome: OverallOutcome.success,
        idDocOutcome: shouldShowIdDocOutcome ? IdDocOutcome.success : undefined,
      },
      testID: getRandomID(),
    },
    mode: 'onChange',
  });
  const {
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <Box>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {shouldShowIdDocOutcome && (
            <IdDocOutcomeSelect
              allowRealOutcome={config?.canMakeRealDocScanCallsInSandbox}
            />
          )}
          <OverallOutcomeSelect />
          <TestIdInput />
          <Button fullWidth type="submit" disabled={!!errors?.testID}>
            {t('cta')}
          </Button>
        </Form>
      </FormProvider>
    </Box>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
    display: grid;
    gap: ${theme.spacing[5]};
  `}
`;

export default SandboxOutcomeContainer;
