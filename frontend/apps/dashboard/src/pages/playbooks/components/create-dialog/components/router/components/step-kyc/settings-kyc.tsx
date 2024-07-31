import { Stack } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  type DataToCollectFormData,
  type DataToCollectMeta,
  OnboardingTemplate,
} from '@/playbooks/utils/machine/types';

import AdditionalDocs from '../additional-docs';
import Footer from '../footer';
import GovDocs from '../gov-docs';
import Header from '../header';
import Investor from '../investor';
import Person from '../person';

type SettingsKycProps = {
  defaultValues: DataToCollectFormData;
  meta: DataToCollectMeta;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const SettingsKyc = ({ meta, onSubmit, onBack, defaultValues }: SettingsKycProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-person',
  });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit } = formMethods;
  const isCustom = meta.onboardingTemplate === OnboardingTemplate.Custom;
  const isInternationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;
  const isFixedPlaybook =
    meta.onboardingTemplate === OnboardingTemplate.Alpaca || meta.onboardingTemplate === OnboardingTemplate.Apex;
  const canEdit = !isInternationalOnly && !isFixedPlaybook;

  const getTitle = () => {
    return canEdit ? t('title.editable') : t('title.non-editable');
  };

  const getSubtitle = () => {
    const onboardingTemplateToSubtitleMap = {
      [OnboardingTemplate.Custom]: t('subtitle.editable'),
      [OnboardingTemplate.Alpaca]: t('subtitle.templates.alpaca'),
      [OnboardingTemplate.Apex]: t('subtitle.templates.apex'),
      [OnboardingTemplate.TenantScreening]: t('subtitle.templates.tenant-screening'),
      [OnboardingTemplate.CarRental]: t('subtitle.templates.car-rental'),
      [OnboardingTemplate.CreditCard]: t('subtitle.templates.credit-card'),
    };
    if (!canEdit) {
      return t('subtitle.non-editable');
    }
    if (meta.onboardingTemplate) {
      return onboardingTemplateToSubtitleMap[meta.onboardingTemplate];
    }
    return t('subtitle.editable');
  };

  return (
    <Stack flexDirection="column" gap={8}>
      <Stack flexDirection="column" gap={5}>
        <Header title={getTitle()} subtitle={getSubtitle()} />
        <FormProvider {...formMethods}>
          <form id="settings-kyc-form" onSubmit={handleSubmit(onSubmit)}>
            <Stack flexDirection="column" gap={5}>
              <Person meta={meta} />
              <GovDocs />
              <AdditionalDocs />
              {isCustom && <Investor />}
            </Stack>
          </form>
        </FormProvider>
      </Stack>
      <Footer onBack={onBack} form="settings-kyc-form" />
    </Stack>
  );
};

export default SettingsKyc;
