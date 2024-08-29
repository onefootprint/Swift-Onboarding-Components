import { Button, Form as FormComponent } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Header from '../header';

import type { NameFormData } from '@/playbooks/utils/machine/types';
import type { PlaybookKind } from '@/playbooks/utils/machine/types';
import useDefaultName from './hooks/use-default-name';

export type StepNameProps = {
  defaultValues: NameFormData;
  meta: {
    kind: PlaybookKind;
  };
  onBack: () => void;
  onSubmit: (data: NameFormData) => void;
};

const StepName = ({ defaultValues, meta, onBack, onSubmit }: StepNameProps) => {
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
          <Header title={t('title')} subtitle={t('subtitle')} />
          <NameContainer>
            <FormComponent.Field>
              <FormComponent.Label>{t('form.name.label')}</FormComponent.Label>
              <FormComponent.Input
                autoFocus
                hasError={!!errors.name}
                placeholder={defaultName}
                {...register('name', {
                  required: t('form.errors.required'),
                })}
              />
              <FormComponent.Errors>{errors.name?.message}</FormComponent.Errors>
            </FormComponent.Field>
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

export default StepName;
