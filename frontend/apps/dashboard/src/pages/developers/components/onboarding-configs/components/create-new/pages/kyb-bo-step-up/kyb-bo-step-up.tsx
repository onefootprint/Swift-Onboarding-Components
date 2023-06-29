import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocRegionality, IdDocType } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import IdDocForm from '../../components/id-doc-form';
import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getFormIdForState from '../../utils/get-form-id-for-state';

type FormData = {
  idDocType: IdDocType[];
  regionality: IdDocRegionality;
  selfieRequired: boolean;
};

const KybBoStepUp = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-new',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { kybBoStepUp } = state.context;

  const methods = useForm<FormData>({
    defaultValues: {
      idDocType: kybBoStepUp ? kybBoStepUp?.idDoc?.types : [],
      selfieRequired: kybBoStepUp?.idDoc?.selfieRequired || false,
      regionality: kybBoStepUp
        ? kybBoStepUp?.idDoc?.regionality
        : IdDocRegionality.international,
    },
  });

  const { handleSubmit } = methods;

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kybBoStepUpSubmitted',
      payload: {
        idDoc: {
          regionality: formData.regionality,
          types: formData.idDocType,
          selfieRequired: formData.selfieRequired,
        },
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <Form
        data-testid="kyb-bo-step-up-form'"
        id={getFormIdForState(state.value)}
        onSubmit={handleSubmit(handleBeforeSubmit)}
      >
        <Section>
          <IdDocForm
            title={t('kyc-step-up.title')}
            description={t('kyc-step-up.description')}
          />
        </Section>
      </Form>
    </FormProvider>
  );
};

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default KybBoStepUp;
