import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  AuthorizedScopesFormData,
  defaultAuthorizedScopesValues,
  Kind,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';

import BusinessScopes from './components/business-scopes';
import PersonalScopes from './components/personal-scopes';

type AuthorizedScopesProps = {
  onBack: () => void;
  playbook: PlaybookFormData;
  kind?: Kind;
  onSubmit: (data: AuthorizedScopesFormData) => void;
  submissionLoading: boolean;
};

const AuthorizedScopes = ({
  onBack,
  playbook,
  kind = Kind.KYC,
  onSubmit,
  submissionLoading,
}: AuthorizedScopesProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection.authorized-scopes',
  );

  // defaultValues populates only the fields that are in the form
  // so we can set everything to true and only the fields we display will submit
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: defaultAuthorizedScopesValues,
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
          {kind === Kind.KYB && <BusinessScopes />}
          <PersonalScopes playbook={playbook} kind={kind} />
          <ButtonContainer>
            <Button
              size="compact"
              variant="secondary"
              onClick={onBack}
              disabled={submissionLoading}
            >
              {t('back')}
            </Button>
            <Button loading={submissionLoading} size="compact" type="submit">
              {t('create-playbook')}
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
