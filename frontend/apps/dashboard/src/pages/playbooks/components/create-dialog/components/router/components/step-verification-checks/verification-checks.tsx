import type { AMLFormData, Business, KybChecksKind, VerificationChecksFormData } from '@/playbooks/utils/machine/types';
import { Button, Stack } from '@onefootprint/ui';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Header from '../header';
import Aml from './components/aml';
import KybChecks from './components/kyb-checks';
import KycCheck from './components/kyc-checks';

export type VerificationChecksProps = {
  defaultAmlValues: AMLFormData;
  isPending: boolean;
  requiresDoc?: boolean;
  allowInternationalResident?: boolean;
  isKyb?: boolean;
  collectBO?: boolean;
  onBack: () => void;
  onSubmit: (formData: VerificationChecksFormData) => void;
  businessInfo?: Business;
};

const VerificationChecks = ({
  defaultAmlValues,
  isPending,
  requiresDoc,
  allowInternationalResident,
  isKyb = false,
  collectBO,
  onBack,
  onSubmit,
  businessInfo,
}: VerificationChecksProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.verification-checks',
  });

  const initialKybKind = getInitialKybKind(isKyb, businessInfo);
  const canRunKyc = isKyb ? collectBO : !allowInternationalResident;
  const canRunKyb = isKyb;

  const showSkipKyc = !allowInternationalResident;
  const showSkipKyb = isKyb;

  const form = useForm<VerificationChecksFormData>({
    defaultValues: {
      runKyb: canRunKyb,
      kybKind: initialKybKind,

      // TODO: Migrate to runKyc
      skipKyc: !canRunKyc,
      amlFormData: defaultAmlValues,
    },
  });
  const { watch } = form;

  const isAmlChecked = watch('amlFormData.enhancedAml');
  const ofac = watch('amlFormData.ofac');
  const pep = watch('amlFormData.pep');
  const adverseMedia = watch('amlFormData.adverseMedia');

  const isMissingSelection = !!isAmlChecked && !ofac && !pep && !adverseMedia;
  const [showError, setShowError] = useState(false);
  const isAmlDisabled = isKyb && !collectBO;

  const handleSubmit = (formData: VerificationChecksFormData) => {
    if (isMissingSelection) {
      setShowError(true);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Stack flexDirection="column" gap={7}>
          <Header title={t('title')} subtitle={t('subtitle')} />
          <Stack direction="column" gap={9} marginBottom={8}>
            {showSkipKyb && <KybChecks canRunFullKyb={initialKybKind === 'full'} />}
            {showSkipKyc && <KycCheck isKyb={isKyb} collectBO={collectBO} requiresDoc={requiresDoc} />}
            <Aml showError={showError} disabled={isAmlDisabled} />
          </Stack>
          <ButtonContainer>
            <Button variant="secondary" onClick={onBack} disabled={isPending}>
              {allT('back')}
            </Button>
            <Button type="submit" loading={isPending}>
              {allT('create')}
            </Button>
          </ButtonContainer>
        </Stack>
      </form>
    </FormProvider>
  );
};

const getInitialKybKind = (isKyb: boolean, businessInfo?: Business): KybChecksKind | undefined => {
  if (!isKyb || !businessInfo) {
    return undefined;
  }
  return businessInfo.basic.address ? 'full' : 'ein';
};

const ButtonContainer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[7]};
    width: 100%;
  `};
`;

export default VerificationChecks;
