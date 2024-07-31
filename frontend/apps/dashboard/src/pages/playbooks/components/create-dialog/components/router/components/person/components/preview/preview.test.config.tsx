import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { BusinessInformation, DataToCollectFormData, Personal } from '@/playbooks/utils/machine/types';
import { OnboardingTemplate, PlaybookKind, defaultPlaybookValuesKYC } from '@/playbooks/utils/machine/types';

import Preview from './preview';

export type PreviewWithContextProps = {
  startingValues?: {
    personal?: Partial<Personal>;
    businessInformation?: Partial<BusinessInformation>;
  };
  kind?: PlaybookKind;
};

const PreviewWithContext = ({ startingValues, kind }: PreviewWithContextProps) => {
  const formMethods = useForm<DataToCollectFormData>({
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
          onStartEditing={() => undefined}
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
