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
};

const AuthorizedScopes = ({
  onBack,
  playbook,
  kind = Kind.KYC,
}: AuthorizedScopesProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection.authorized-scopes',
  );

  // defaultValues populates only the fields that are in the form
  // so we can set everything to true and only the fields we display will submit
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: defaultAuthorizedScopesValues,
  });

  return (
    <Container>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
        <Typography variant="body-3">{t('subtitle')}</Typography>
      </Header>
      <FormProvider {...formMethods}>
        <Form>
          {kind === Kind.KYB && <BusinessScopes />}
          <OptionsContainer>
            <PersonalScopes playbook={playbook} kind={kind} />
          </OptionsContainer>
          <ButtonContainer>
            <Button size="compact" variant="secondary" onClick={onBack}>
              {t('back')}
            </Button>
            <Button size="compact" type="submit">
              {t('next')}
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

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
    grid-template-columns: repeat(2, 1fr);
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export default AuthorizedScopes;
