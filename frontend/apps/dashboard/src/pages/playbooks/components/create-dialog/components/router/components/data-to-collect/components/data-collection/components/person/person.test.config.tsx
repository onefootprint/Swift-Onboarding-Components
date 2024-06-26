import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { DataToCollectFormData, DataToCollectMeta, Personal } from '@/playbooks/utils/machine/types';
import { PlaybookKind, defaultPlaybookValuesKYC } from '@/playbooks/utils/machine/types';

import PersonalInfoAndDocs from './person';

export type PersonInformationWithContextProps = {
  startingValues: Partial<Personal>;
  meta?: DataToCollectMeta;
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
  const formMethods = useForm<DataToCollectFormData>({
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
