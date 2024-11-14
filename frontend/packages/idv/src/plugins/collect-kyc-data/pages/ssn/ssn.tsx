import { IdDI } from '@onefootprint/types';
import { Grid, Stack, useConfirmationDialog } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { TFunction } from 'i18next';
import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import type { SyncDataFieldErrors } from '../../hooks/use-sync-data';
import useSyncData, { omitPhoneAndEmail } from '../../hooks/use-sync-data';
import type { KycData } from '../../utils/data-types';
import { getTaxIdKind, getTypeOfTaxId, isSsnOptional } from '../../utils/ssn-utils';
import SSN4 from './components/ssn4';
import TaxId from './components/tax-id';
import useConvertFormData from './hooks/use-convert-form-data';
import type { FormValues } from './ssn.types';

type T = TFunction<'idv', 'kyc.pages.ssn'>;

type TaxPayerIdKind = NonNullable<ReturnType<typeof getTaxIdKind>>;

type SsnOrTaxIdProps = {
  hideDisclaimer?: boolean;
  hideHeader?: boolean;
  onCancel?: () => void;
  onComplete?: (args: KycData) => void;
};

const fieldByDi: Partial<Record<IdDI, keyof FormValues>> = {
  [IdDI.ssn4]: 'ssn4',
  [IdDI.ssn9]: 'ssn9',
  [IdDI.usTaxId]: 'usTaxId',
};

const getTitle = (t: T, kind?: TaxPayerIdKind) => {
  if (kind === 'ssn4') return t('ssn4-title');
  if (kind === 'ssn9') return t('ssn9-title');
  if (kind === 'itin') return t('us-tax-id-title');
  if (kind === 'usTaxId') return t('us-tax-id-title');
  return '';
};

const getSubTitle = (t: T, kind?: TaxPayerIdKind) => {
  if (kind === 'ssn4') return t('ssn4-subtitle');
  if (kind === 'ssn9') return t('ssn9-subtitle');
  if (kind === 'itin') return t('ssn9-subtitle');
  if (kind === 'usTaxId') return t('ssn9-subtitle');
  return '';
};

const filterTypeOfTaxId = (value?: string): 'ssn9' | 'itin' | 'usTaxId' => {
  switch (getTypeOfTaxId('usTaxId', value)) {
    case 'ssn9':
      return 'ssn9';
    case 'itin':
      return 'itin';
    default:
      return 'usTaxId';
  }
};

const SsnOrTaxId = ({ hideDisclaimer, hideHeader, onCancel, onComplete }: SsnOrTaxIdProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.ssn' });
  const confirmationDialog = useConfirmationDialog();
  const [state, send] = useCollectKycDataMachine();
  const { data, requirement, config } = state.context;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();
  const requirementTaxIdKind = getTaxIdKind(requirement);
  const isOptional = isSsnOptional(requirement);
  const [isTaxPayerIdSkipped, setIsTaxPayerIdSkipped] = useState(false);

  const title = getTitle(t, requirementTaxIdKind);
  const subtitle = getSubTitle(t, requirementTaxIdKind);
  const hasDocStepup = config.requiresIdDoc;

  const methods = useForm<FormValues>({
    defaultValues: {
      ssn4: data[IdDI.ssn4]?.value,
      ssn9: data[IdDI.ssn9]?.value,
      usTaxId: data[IdDI.usTaxId]?.value,
    },
  });
  const { getValues, setError } = methods;

  const sendData = (d: KycData) => {
    syncData({
      data: omitPhoneAndEmail(d),
      onSuccess: cleanData => {
        send({ type: 'dataSubmitted', payload: cleanData });
        onComplete?.(cleanData);
      },
      onError: (error: SyncDataFieldErrors) => {
        Object.entries(error).forEach(([k, message]) => {
          const di = k as IdDI;
          const field = fieldByDi[di];
          if (field) {
            setError(field, { message }, { shouldFocus: true });
          }
        });
      },
    });
  };

  const submitForm = (formData: FormValues) => {
    sendData(convertFormData(formData));
  };

  const skipForm = () => {
    const convertedData = convertFormData(getValues(), true);
    sendData(convertedData);
  };

  const confirmIfWantsToSkip = () => {
    confirmationDialog.open({
      title: t('skip.confirmation.title'),
      description: hasDocStepup
        ? t('skip.confirmation.with-stepup-description')
        : t('skip.confirmation.without-stepup-description'),
      primaryButton: {
        label: t('skip.confirmation.yes'),
        onClick: skipForm,
      },
      secondaryButton: {
        label: t('skip.confirmation.no'),
      },
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isTaxPayerIdSkipped) {
      confirmIfWantsToSkip();
    } else {
      methods.handleSubmit(submitForm)(event);
    }
  };

  return (
    <>
      {hideHeader ? null : <NavigationHeader />}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit}>
          <Grid.Container gap={7} width="100%">
            {hideHeader ? null : <HeaderTitle title={title} subtitle={subtitle} />}
            <Stack gap={7} direction="column">
              {requirementTaxIdKind === 'usTaxId' ? (
                <TaxId
                  disabled={isTaxPayerIdSkipped}
                  isOptional={isOptional}
                  isSkipped={isTaxPayerIdSkipped}
                  onSkipChange={() => setIsTaxPayerIdSkipped(prev => !prev)}
                  vaultTaxId="usTaxId"
                  visualTaxId={filterTypeOfTaxId(data[IdDI.usTaxId]?.value)}
                />
              ) : null}
              {requirementTaxIdKind === 'ssn9' ? (
                <TaxId
                  disabled={isTaxPayerIdSkipped}
                  hideDisclaimer={hideDisclaimer}
                  isOptional={isOptional}
                  isSkipped={isTaxPayerIdSkipped}
                  onSkipChange={() => setIsTaxPayerIdSkipped(prev => !prev)}
                  vaultTaxId="ssn9"
                  visualTaxId="ssn9"
                />
              ) : null}
              {requirementTaxIdKind === 'ssn4' ? (
                <SSN4
                  disabled={isTaxPayerIdSkipped}
                  isOptional={isOptional}
                  isSkipped={isTaxPayerIdSkipped}
                  onSkipChange={() => setIsTaxPayerIdSkipped(prev => !prev)}
                />
              ) : null}
            </Stack>
            <EditableFormButtonContainer
              isLoading={mutation.isPending}
              onCancel={onCancel}
              submitButtonTestID="ssn-save-edit-button"
            />
          </Grid.Container>
        </form>
      </FormProvider>
    </>
  );
};

export default SsnOrTaxId;
