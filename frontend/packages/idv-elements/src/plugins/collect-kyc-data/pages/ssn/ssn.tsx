import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';
import { Grid, Stack, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { getSsnKind } from '../../utils/ssn-utils';
import SSN4 from './components/ssn4';
import SSN9 from './components/ssn9';
import useConvertFormData from './hooks/use-convert-form-data';
import type { FormData } from './types';

type SSNProps = {
  onComplete?: () => void;
  onCancel?: () => void;
  ctaLabel?: string;
  hideDisclaimer?: boolean;
  hideHeader?: boolean;
};

const SSN = ({
  hideDisclaimer,
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: SSNProps) => {
  const { t } = useTranslation('pages.ssn');
  const confirmationDialog = useConfirmationDialog();
  const [state, send] = useCollectKycDataMachine();
  const { data, requirement, config } = state.context;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();
  const ssnKind = getSsnKind(requirement);
  const isOptional =
    requirement.optionalAttributes.includes(CollectedKycDataOption.ssn9) ||
    requirement.optionalAttributes.includes(CollectedKycDataOption.ssn4);

  const title = ssnKind === 'ssn9' ? t('full.title') : t('last-four.title');
  const subtitle =
    ssnKind === 'ssn9' ? t('full.subtitle') : t('last-four.subtitle');

  const hasDocStepup = config.requiresIdDoc;

  const methods = useForm<FormData>({
    defaultValues: {
      ssn9: data[IdDI.ssn9]?.value,
      ssn4: data[IdDI.ssn4]?.value,
    },
  });
  const { getValues } = methods;
  const isSsn4Disabled = data?.[IdDI.ssn4]?.disabled;
  const isSsn9Disabled = data?.[IdDI.ssn9]?.disabled;

  const onSubmitForm = (formData: FormData) => {
    const convertedData = convertFormData(formData);
    syncData({
      data: convertedData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'dataSubmitted',
          payload: convertedData,
        });
        onComplete?.();
      },
    });
  };

  const onSubmitSkippedForm = () => {
    const convertedData = convertFormData(getValues(), true);
    send({
      type: 'dataSubmitted',
      payload: convertedData,
    });
    onComplete?.();
  };

  const handleSkip = () => {
    confirmationDialog.open({
      title: t('skip.confirmation.title'),
      description: hasDocStepup
        ? t('skip.confirmation.with-stepup-description')
        : t('skip.confirmation.without-stepup-description'),
      primaryButton: {
        label: t('skip.confirmation.yes'),
        onClick: onSubmitSkippedForm,
      },
      secondaryButton: {
        label: t('skip.confirmation.no'),
      },
    });
  };

  return (
    <>
      {!hideHeader && <NavigationHeader />}
      <FormProvider {...methods}>
        <Grid.Container
          as="form"
          rowGap={7}
          onSubmit={methods.handleSubmit(onSubmitForm)}
        >
          {!hideHeader && <HeaderTitle title={title} subtitle={subtitle} />}
          <Stack gap={5} direction="column">
            {ssnKind === 'ssn9' ? (
              <SSN9 hideDisclaimer={hideDisclaimer} disabled={isSsn9Disabled} />
            ) : (
              <SSN4 disabled={isSsn4Disabled} />
            )}
          </Stack>
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            onSkip={isOptional ? handleSkip : undefined}
            ctaLabel={ctaLabel}
            skipLabel={t('skip.cta')}
            submitButtonTestID="ssn-save-edit-button"
          />
        </Grid.Container>
      </FormProvider>
    </>
  );
};

export default SSN;
