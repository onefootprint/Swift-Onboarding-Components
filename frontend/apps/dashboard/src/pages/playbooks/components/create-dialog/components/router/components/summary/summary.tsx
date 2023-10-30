import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  SummaryFormData,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection';

type SummaryProps = {
  meta: SummaryMeta;
  onSubmit: (data: SummaryFormData) => void;
  onBack: () => void;
  defaultValues: SummaryFormData;
};

const Summary = ({ meta, onSubmit, onBack, defaultValues }: SummaryProps) => {
  const { t, allT } = useTranslation('pages.playbooks.dialog.summary');
  const formMethods = useForm<SummaryFormData>({
    defaultValues,
  });
  const { handleSubmit } = formMethods;
  const internationalOnly =
    meta.residency?.allowInternationalResidents &&
    !meta.residency.allowUsResidents;

  return (
    <Container>
      <Header>
        <Typography variant="label-1" color="secondary">
          {t('title')}
        </Typography>
        <Typography variant="body-2" color="secondary">
          {internationalOnly
            ? t('subtitle-international-only')
            : t('subtitle-default')}
        </Typography>
      </Header>
      <FormProvider {...formMethods}>
        <Form id="your-playbook-form" onSubmit={handleSubmit(onSubmit)}>
          <DataCollection meta={meta} />
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

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

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
    white-space: pre-wrap;
  `};
`;

export default Summary;
