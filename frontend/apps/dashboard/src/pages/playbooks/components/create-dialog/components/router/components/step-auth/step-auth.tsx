import SignInMethods from '@/create-playbook/components/router/components/step-auth/components/sign-in-methods/sign-in-methods';
import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Button, Stack } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Header from '../header';
import Signup from './components/sign-up';

type StepAuthProps = {
  defaultValues: DataToCollectFormData;
  isLoading?: boolean;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const StepAuth = ({ onSubmit, onBack, defaultValues, isLoading }: StepAuthProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-auth',
  });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });

  return (
    <Container>
      <FormProvider {...formMethods}>
        <Header title={t('title')} subtitle={t('subtitle')} />
        <Stack flexDirection="column" gap={4}>
          <Signup />
          <SignInMethods />
        </Stack>
        <Form id="settings-auth-form" onSubmit={formMethods.handleSubmit(onSubmit)}>
          <ButtonContainer>
            <Button variant="secondary" onClick={onBack}>
              {allT('back')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {allT('create')}
            </Button>
          </ButtonContainer>
        </Form>
      </FormProvider>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    white-space: pre-wrap;
    width: 520px;
  `};
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export default StepAuth;
