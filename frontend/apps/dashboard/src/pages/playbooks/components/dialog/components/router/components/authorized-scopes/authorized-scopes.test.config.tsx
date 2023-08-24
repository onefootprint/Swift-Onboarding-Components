import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  AuthorizedScopesFormData,
  defaultAuthorizedScopesValues,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  Kind,
} from '@/playbooks/utils/machine/types';

import AuthorizedScopes from './authorized-scopes';

export type AuthorizedScopesWithContextProps = {
  kind: Kind;
  submissionLoading?: boolean;
};

const AuthorizedScopesWithContext = ({
  kind,
  submissionLoading = false,
}: AuthorizedScopesWithContextProps) => {
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: defaultAuthorizedScopesValues,
  });
  const playbook =
    kind === Kind.KYB ? defaultPlaybookValuesKYB : defaultPlaybookValuesKYC;

  return (
    <FormProvider {...formMethods}>
      <AuthorizedScopes
        kind={kind}
        playbook={playbook}
        onBack={() => {}}
        onSubmit={() => {}}
        submissionLoading={submissionLoading}
      />
    </FormProvider>
  );
};

export default AuthorizedScopesWithContext;
