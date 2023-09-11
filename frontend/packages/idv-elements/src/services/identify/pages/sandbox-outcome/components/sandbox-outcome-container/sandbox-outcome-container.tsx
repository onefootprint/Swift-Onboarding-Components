import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDocOutcomes, OverallOutcomes } from '@onefootprint/types';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import getRandomID from '../../utils/get-random-id';
import IdDocOutcome from '../id-doc-outcome';
import OverallOutcome from '../overall-outcome';
import TestIdInput from '../test-id-input';

export type FormDataType = {
  testID: string;
  outcomes: { overallOutcome: OverallOutcomes; idDocOutcome: IdDocOutcomes };
};

export const SandboxOutcomeContainer = ({
  onSubmit,
  config,
}: {
  onSubmit: (formData: FormDataType) => void;
  config?: PublicOnboardingConfig;
}) => {
  const { t } = useTranslation('pages.sandbox-outcome');
  const shouldShowIdDocOutcome = config?.requiresIdDoc;
  const formMethods = useForm<FormDataType>({
    defaultValues: {
      outcomes: {
        overallOutcome: OverallOutcomes.success,
        idDocOutcome: shouldShowIdDocOutcome
          ? IdDocOutcomes.success
          : undefined,
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
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {shouldShowIdDocOutcome && (
            <IdDocOutcome
              allowRealOutcome={config?.canMakeRealDocScanCallsInSandbox}
            />
          )}
          <OverallOutcome />
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
    gap: ${theme.spacing[7]};
  `}
`;

export default SandboxOutcomeContainer;
