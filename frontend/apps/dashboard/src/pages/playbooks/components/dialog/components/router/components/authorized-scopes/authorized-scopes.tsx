import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  AuthorizedScopesFormData,
  defaultAuthorizedScopesValues,
} from '@/playbooks/utils/machine/types';

type AuthorizedScopesProps = {
  onBack: () => void;
};

const AuthorizedScopes = ({ onBack }: AuthorizedScopesProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection.authorized-scopes',
  );
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
          <OptionsContainer />
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
