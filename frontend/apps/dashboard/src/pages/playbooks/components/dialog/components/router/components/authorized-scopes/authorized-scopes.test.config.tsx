import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { AuthorizedScopesFormData } from '@/playbooks/utils/machine/types';
import {
  defaultAuthorizedScopesValues,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import AuthorizedScopes from './authorized-scopes';

export type AuthorizedScopesWithContextProps = {
  kind: PlaybookKind;
  submissionLoading?: boolean;
  onSubmit?: (data: AuthorizedScopesFormData) => void;
};

const AuthorizedScopesWithContext = ({
  kind,
  submissionLoading = false,
  onSubmit = () => {},
}: AuthorizedScopesWithContextProps) => {
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: defaultAuthorizedScopesValues,
  });
  const playbook =
    kind === PlaybookKind.Kyb
      ? defaultPlaybookValuesKYB
      : defaultPlaybookValuesKYC;

  return (
    <FormProvider {...formMethods}>
      <AuthorizedScopes
        kind={kind}
        playbook={playbook}
        onBack={() => {}}
        onSubmit={onSubmit}
        submissionLoading={submissionLoading}
      />
    </FormProvider>
  );
};

export default AuthorizedScopesWithContext;
