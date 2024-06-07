import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { NameFormData, PlaybookKind } from '@/playbooks/utils/machine/types';
import { defaultNameFormData } from '@/playbooks/utils/machine/types';

import NameYourPlaybook from './name-your-playbook';

export type NameYourPlaybookWithContextProps = {
  kind: PlaybookKind;
};

const NameYourPlaybookWithContext = ({ kind }: NameYourPlaybookWithContextProps) => {
  const formMethods = useForm<NameFormData>({
    defaultValues: defaultNameFormData,
  });

  return (
    <FormProvider {...formMethods}>
      <NameYourPlaybook
        kind={kind}
        onBack={() => undefined}
        onSubmit={() => undefined}
        defaultValues={defaultNameFormData}
      />
    </FormProvider>
  );
};

export default NameYourPlaybookWithContext;
