import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  BusinessInformation,
  Personal,
  SummaryFormData,
} from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  OnboardingTemplate,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import Preview from './preview';

export type PreviewWithContextProps = {
  startingValues?: {
    personal?: Partial<Personal>;
    businessInformation?: Partial<BusinessInformation>;
  };
  kind?: PlaybookKind;
};

const PreviewWithContext = ({
  startingValues,
  kind,
}: PreviewWithContextProps) => {
  const formMethods = useForm<SummaryFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYC,
      personal: {
        ...defaultPlaybookValuesKYC.personal,
        ...startingValues?.personal,
      },
      businessInformation: {
        ...startingValues?.businessInformation,
      },
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Preview
          onStartEditing={() => {}}
          meta={{
            kind: kind || PlaybookKind.Kyc,
            onboardingTemplate: OnboardingTemplate.Custom,
            residency: {
              allowUsResidents: true,
              allowUsTerritories: false,
              allowInternationalResidents: false,
            },
          }}
        />
      </form>
    </FormProvider>
  );
};

export default PreviewWithContext;
