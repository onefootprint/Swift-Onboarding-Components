import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { isAuth } from '@/playbooks/utils/kind';
import type {
  SummaryFormData,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection';

type SummaryProps = {
  defaultValues: SummaryFormData;
  meta: SummaryMeta;
  onBack: () => void;
  onSubmit: (data: SummaryFormData) => void;
};

const Summary = ({ meta, onSubmit, onBack, defaultValues }: SummaryProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary',
  });

  const getTitle = (): string =>
    isAuth(meta.kind) ? t('auth.title') : t('title');

  const getSubtitle = (): string => {
    if (isAuth(meta.kind)) return t('auth.subtitle');

    const internationalOnly =
      meta.residency?.allowInternationalResidents &&
      !meta.residency.allowUsResidents;

    return internationalOnly
      ? t('subtitle-international-only')
      : t('subtitle-default');
  };

  const formMethods = useForm<SummaryFormData>({ defaultValues });
  const { handleSubmit } = formMethods;

  return (
    <Container>
      <Header>
        <Text variant="label-1" color="secondary">
          {getTitle()}
        </Text>
        <Text variant="body-2" color="secondary">
          {getSubtitle()}
        </Text>
      </Header>
      <FormProvider {...formMethods}>
        <Form id="your-playbook-form" onSubmit={handleSubmit(onSubmit)}>
          <DataCollection meta={meta} />
          <ButtonContainer>
            <Button variant="secondary" onClick={onBack}>
              {allT('back')}
            </Button>
            <Button type="submit">{allT('next')}</Button>
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
