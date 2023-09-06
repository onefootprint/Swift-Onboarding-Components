import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { Kind, NameFormData } from '@/playbooks/utils/machine/types';
import { defaultNameFormData } from '@/playbooks/utils/machine/types';

import NameYourPlaybook from './name-your-playbook';

export type NameYourPlaybookWithContextProps = {
  kind: Kind;
};

const NameYourPlaybookWithContext = ({
  kind,
}: NameYourPlaybookWithContextProps) => {
  const formMethods = useForm<NameFormData>({
    defaultValues: defaultNameFormData,
  });

  return (
    <FormProvider {...formMethods}>
      <NameYourPlaybook
        kind={kind}
        onBack={() => {}}
        onSubmit={() => {}}
        defaultValues={defaultNameFormData}
      />
    </FormProvider>
  );
};

export default NameYourPlaybookWithContext;
