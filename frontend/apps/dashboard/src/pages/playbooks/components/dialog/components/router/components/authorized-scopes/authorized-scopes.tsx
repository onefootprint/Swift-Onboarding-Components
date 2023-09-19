import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  AuthorizedScopesFormData,
  SummaryFormData,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';
import {
  defaultAuthorizedScopesValues,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import Business from './components/business';
import Person from './components/person';

type AuthorizedScopesProps = {
  meta: SummaryMeta;
  onBack: () => void;
  onSubmit: (data: AuthorizedScopesFormData) => void;
  playbook: SummaryFormData;
  submissionLoading: boolean;
};

const AuthorizedScopes = ({
  meta,
  onBack,
  onSubmit,
  playbook,
  submissionLoading,
}: AuthorizedScopesProps) => {
  const { t, allT } = useTranslation(
    'pages.playbooks.dialog.authorized-scopes',
  );
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: { ...defaultAuthorizedScopesValues },
  });
  const { handleSubmit } = formMethods;

  return (
    <Container>
      <Header>
        <Typography variant="label-1" color="secondary">
          {t('title')}
        </Typography>
        <Typography variant="body-2" color="secondary">
          {t('subtitle')}
        </Typography>
      </Header>
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {meta.kind === PlaybookKind.Kyb && <Business />}
          <Person playbook={playbook} meta={meta} />
          <ButtonContainer>
            <Button
              size="compact"
              variant="secondary"
              onClick={onBack}
              disabled={submissionLoading}
            >
              {allT('back')}
            </Button>
            <Button loading={submissionLoading} size="compact" type="submit">
              {allT('create')}
            </Button>
          </ButtonContainer>
        </Form>
      </FormProvider>
    </Container>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding-top: ${theme.spacing[5]};
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
  `};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export default AuthorizedScopes;
