import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CountryCode,
  IdDI,
  isCountryCode,
  UsLegalStatus,
} from '@onefootprint/types';
import { CountrySelectOption } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { KycData } from '../../utils/data-types';
import getInitialCountry from '../../utils/get-initial-country';
import CountryFields from './components/country-fields';
import StatusFields from './components/status-fields';
import VisaFields from './components/visa-fields';
import useConvertFormData from './hooks/use-convert-form-data';
import { FormData } from './types';

type LegalStatusProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: (args: KycData) => void;
  onCancel?: () => void;
};

type CountrySelectOptionOrPlaceholder = {
  label: string | undefined;
  value: CountryCode | undefined;
};

const LegalStatus = ({
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: LegalStatusProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('pages.legal-status');
  const convertFormData = useConvertFormData();
  const defaultLegalStatus =
    data[IdDI.usLegalStatus]?.value ?? UsLegalStatus.citizen;

  const getCountrySelectOption = (maybeCountryCode?: string) => {
    if (maybeCountryCode && isCountryCode(maybeCountryCode)) {
      const fullCountryData = getInitialCountry(
        maybeCountryCode as CountryCode,
        true,
      );
      return { label: fullCountryData?.label, value: fullCountryData?.value };
    }
    return undefined;
  };
  const defaultNationality = getCountrySelectOption(
    data[IdDI.nationality]?.value,
  );

  const citizenshipsValue = data[IdDI.citizenships]?.value;
  let defaultCitizenships: CountrySelectOptionOrPlaceholder[] = [
    { label: '', value: undefined },
  ];
  if (citizenshipsValue) {
    defaultCitizenships = citizenshipsValue
      .map(maybeCountryCode => getCountrySelectOption(maybeCountryCode))
      .filter((option): option is CountrySelectOption => !!option);
  }

  let defaultVisa = {};
  const visaKindValue = data?.[IdDI.visaKind]?.value;
  const visaExpirationValue = data?.[IdDI.visaExpirationDate]?.value;
  if (visaKindValue || visaExpirationValue) {
    const visaKindLabel = visaKindValue
      ? t(`form.visa-kind.mapping.${visaKindValue}`)
      : undefined;
    defaultVisa = {
      kind: { label: visaKindLabel, value: visaKindValue },
      expirationDate: visaExpirationValue,
    };
  }

  const methods = useForm<FormData>({
    defaultValues: {
      usLegalStatus: defaultLegalStatus,
      nationality: defaultNationality,
      citizenships: defaultCitizenships,
      visa: defaultVisa,
    },
  });

  const selectedOption = methods.watch('usLegalStatus');

  const handleBeforeSubmit = (formData: FormData) => {
    const convertedData = convertFormData(formData);
    syncData({
      data: convertedData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'dataSubmitted',
          payload: convertedData,
        });
        onComplete?.(convertedData);
      },
    });
  };

  return (
    <>
      {hideHeader ? null : (
        <>
          <NavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
        </>
      )}
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(handleBeforeSubmit)}>
          <StatusFields />
          {selectedOption && selectedOption !== UsLegalStatus.citizen && (
            <CountryFields />
          )}
          {selectedOption === UsLegalStatus.visa && <VisaFields />}
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
            submitButtonTestID="continue-button"
          />
        </Form>
      </FormProvider>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default LegalStatus;
