import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import Header from '../header';
import Preview from './components/preview';

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
  const { handleSubmit } = useForm<DataToCollectFormData>({ defaultValues });

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Preview />
      <Form id="settings-auth-form" onSubmit={handleSubmit(onSubmit)}>
        <ButtonContainer>
          <Button variant="secondary" onClick={onBack}>
            {allT('back')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {allT('create')}
          </Button>
        </ButtonContainer>
      </Form>
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
