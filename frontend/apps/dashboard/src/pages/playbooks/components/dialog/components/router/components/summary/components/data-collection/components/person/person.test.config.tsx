import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  personal,
  SummaryFormData,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import PersonalInfoAndDocs from './person';

export type PersonInformationWithContextProps = {
  startingValues: Partial<personal>;
  meta?: SummaryMeta;
};

const PersonalInfoAndDocsWithContext = ({
  startingValues,
  meta = {
    kind: PlaybookKind.Kyc,
    residency: {
      allowUsResidents: true,
      allowUsTerritories: true,
      allowInternationalResidents: false,
    },
  },
}: PersonInformationWithContextProps) => {
  const formMethods = useForm<SummaryFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYC,
      personal: {
        ...defaultPlaybookValuesKYC.personal,
        ...startingValues,
      },
    },
  });

  return (
    <FormProvider {...formMethods}>
      <form>
        <PersonalInfoAndDocs meta={meta} />
      </form>
    </FormProvider>
  );
};

export default PersonalInfoAndDocsWithContext;
