import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { AuthorizedScopesFormData } from '@/playbooks/utils/machine/types';
import {
  defaultAuthorizedScopesValues,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  Kind,
} from '@/playbooks/utils/machine/types';

import AuthorizedScopes from './authorized-scopes';

export type AuthorizedScopesWithContextProps = {
  kind: Kind;
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
    kind === Kind.KYB ? defaultPlaybookValuesKYB : defaultPlaybookValuesKYC;

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
