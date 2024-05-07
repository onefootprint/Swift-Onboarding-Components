import { Button, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  type AMLFormData,
  KycOptionsForBeneficialOwners,
  type VerificationChecksFormData,
} from 'src/pages/playbooks/utils/machine/types';
import styled, { css } from 'styled-components';

import Aml from './components/aml';
import KycCheck from './components/kyc-check';

export type VerificationChecksProps = {
  defaultAmlValues: AMLFormData;
  isLoading: boolean;
  requiresDoc?: boolean;
  allowInternationalResident?: boolean;
  isKyb?: boolean;
  collectBO?: boolean;
  onBack: () => void;
  onSubmit: (formData: VerificationChecksFormData) => void;
};

const VerificationChecks = ({
  defaultAmlValues,
  isLoading,
  requiresDoc,
  allowInternationalResident,
  isKyb,
  collectBO,
  onBack,
  onSubmit,
}: VerificationChecksProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.verification-checks',
  });
  const canRunKyc = isKyb ? collectBO : !allowInternationalResident;
  const showSkipKyc = !allowInternationalResident;
  const formMethods = useForm<VerificationChecksFormData>({
    defaultValues: {
      skipKyc: !canRunKyc,
      amlFormData: defaultAmlValues,
      kycOptionForBeneficialOwners:
        isKyb && canRunKyc ? KycOptionsForBeneficialOwners.primary : undefined,
    },
  });
  const { watch, handleSubmit } = formMethods;

  const isAmlChecked = watch('amlFormData.enhancedAml');
  const ofac = watch('amlFormData.ofac');
  const pep = watch('amlFormData.pep');
  const adverseMedia = watch('amlFormData.adverseMedia');
  const isMissingSelection = !!isAmlChecked && !ofac && !pep && !adverseMedia;
  const [showError, setShowError] = useState(false);
  const disableAml = isKyb && !collectBO;

  const handleBeforeSubmit = (formData: VerificationChecksFormData) => {
    if (isMissingSelection) {
      setShowError(true);
      return;
    }
    onSubmit(formData);
  };

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Header>
          <Text variant="label-1" color="secondary">
            {t('title')}
          </Text>
          <Text variant="body-2" color="secondary">
            {t('subtitle')}
          </Text>
        </Header>
        {showSkipKyc && (
          <KycCheck
            isKyb={isKyb}
            collectBO={collectBO}
            requiresDoc={requiresDoc}
          />
        )}
        <Aml showError={showError} disabled={disableAml} />
        <ButtonContainer>
          <Button variant="secondary" onClick={onBack} disabled={isLoading}>
            {allT('back')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {allT('pages.playbooks.create-button')}
          </Button>
        </ButtonContainer>
      </Form>
    </FormProvider>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `};
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[7]};
    width: 100%;
  `};
`;

export default VerificationChecks;
