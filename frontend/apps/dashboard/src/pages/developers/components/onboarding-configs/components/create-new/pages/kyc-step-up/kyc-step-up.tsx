import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocRegionality, IdDocType } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import IdDocForm from '../../components/id-doc-form';
import { useOnboardingConfigMachine } from '../../components/machine-provider';

type FormData = {
  idDocType: IdDocType[];
  regionality: IdDocRegionality;
  selfieRequired: boolean;
};

const KycStepUp = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-new',
  );
  const [state, send] = useOnboardingConfigMachine();

  const { kycStepUp } = state.context;

  const methods = useForm<FormData>({
    defaultValues: {
      idDocType: kycStepUp?.idDoc?.types ?? [],
      selfieRequired: kycStepUp?.idDoc?.selfieRequired || false,
      regionality: kycStepUp
        ? kycStepUp?.idDoc?.regionality
        : IdDocRegionality.international,
    },
  });

  const { handleSubmit } = methods;

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kycStepUpSubmitted',
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
        data-testid="kyc-step-up-form"
        onSubmit={handleSubmit(handleBeforeSubmit)}
      >
        <Section>
          <SectionTitle>
            <Typography variant="label-2">{t('kyc-step-up.title')}</Typography>
            <Typography variant="body-3">
              {t('kyc-step-up.description')}
            </Typography>
          </SectionTitle>

          <IdDocForm
            title={t('id-doc.title')}
            description={t('id-doc.description')}
          />
        </Section>
      </Form>
    </FormProvider>
  );
};
const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const SectionTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

export default KycStepUp;
