import { Button, Text, TextInput } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { NameFormData } from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';
import useDefaultName from './hooks/use-default-name';

export type NameProps = {
  defaultValues: NameFormData;
  meta: {
    kind: PlaybookKind;
  };
  onBack: () => void;
  onSubmit: (data: NameFormData) => void;
};

const name = ({ defaultValues, meta, onBack, onSubmit }: NameProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.name' });
  const defaultName = useDefaultName({ kind: meta.kind });
  const formMethods = useForm<NameFormData>({
    defaultValues: {
      name: defaultValues.name || defaultName,
    },
  });
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods;

  return (
    <Container>
      <FormProvider {...formMethods}>
        <Form id="playbook-name-form" onSubmit={handleSubmit(onSubmit)}>
          <Header>
            <Text variant="label-1" color="secondary">
              {t('title')}
            </Text>
            <Text variant="body-2" color="secondary">
              {t('subtitle')}
            </Text>
          </Header>
          <NameContainer>
            <TextInput
              autoFocus
              hasError={!!errors.name}
              hint={errors.name?.message}
              label={t('form.name.label')}
              placeholder={defaultName}
              {...register('name', {
                required: t('form.errors.required'),
              })}
            />
          </NameContainer>
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
const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
    white-space: pre-wrap;
  `};
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

const NameContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-top: ${theme.spacing[5]};
    width: 100%;
  `};
`;

export default name;
