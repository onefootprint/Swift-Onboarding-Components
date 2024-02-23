import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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
};

const AuthorizedScopes = ({
  meta,
  onBack,
  onSubmit,
  playbook,
}: AuthorizedScopesProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.authorized-scopes',
  });
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: { ...defaultAuthorizedScopesValues },
  });
  const { handleSubmit } = formMethods;

  return (
    <Container>
      <Header>
        <Text variant="label-1" color="secondary">
          {t('title')}
        </Text>
        <Text variant="body-2" color="secondary">
          {t('subtitle')}
        </Text>
      </Header>
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {meta.kind === PlaybookKind.Kyb && <Business />}
          <Person playbook={playbook} meta={meta} />
          <ButtonContainer>
            <Button size="compact" variant="secondary" onClick={onBack}>
              {allT('back')}
            </Button>
            <Button size="compact" type="submit">
              {allT('next')}
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
