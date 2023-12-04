import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { isAuth } from '@/playbooks/utils/kind';
import type {
  SummaryFormData,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection';

type TFunction = ReturnType<typeof useTranslation>['t'];
type SummaryProps = {
  defaultValues: SummaryFormData;
  meta: SummaryMeta;
  onBack: () => void;
  onSubmit: (data: SummaryFormData) => void;
};

const getTitle = (t: TFunction, meta: SummaryMeta): string =>
  isAuth(meta.kind) ? t('auth.title') : t('title');

const getSubtitle = (t: TFunction, meta: SummaryMeta): string => {
  if (isAuth(meta.kind)) return t('auth.subtitle');

  const internationalOnly =
    meta.residency?.allowInternationalResidents &&
    !meta.residency.allowUsResidents;

  return internationalOnly
    ? t('subtitle-international-only')
    : t('subtitle-default');
};

const Summary = ({ meta, onSubmit, onBack, defaultValues }: SummaryProps) => {
  const { t, allT } = useTranslation('pages.playbooks.dialog.summary');
  const formMethods = useForm<SummaryFormData>({ defaultValues });
  const { handleSubmit } = formMethods;
  const title = getTitle(t, meta);
  const subtitle = getSubtitle(t, meta);

  return (
    <Container>
      <Header>
        <Typography variant="label-1" color="secondary">
          {title}
        </Typography>
        <Typography variant="body-2" color="secondary">
          {subtitle}
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
