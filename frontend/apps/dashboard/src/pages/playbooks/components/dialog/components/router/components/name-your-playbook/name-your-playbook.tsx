import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, TextInput, Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Kind, NameFormData } from '@/playbooks/utils/machine/types';

type NameYourPlaybookProps = {
  kind?: Kind;
  onSubmit: (data: NameFormData) => void;
  onBack: () => void;
  defaultValues: NameFormData;
};

const NameYourPlaybook = ({
  kind = Kind.KYC,
  onSubmit,
  onBack,
  defaultValues,
}: NameYourPlaybookProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.name-your-playbook');
  const formMethods = useForm<NameFormData>({
    defaultValues,
  });
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = formMethods;
  useEffect(() => {
    setValue('kind', kind);
  }, [setValue, kind]);

  return (
    <Container>
      <FormProvider {...formMethods}>
        <Form id="your-playbook-form" onSubmit={handleSubmit(onSubmit)}>
          <Header>
            <Typography variant="label-1" color="secondary">
              {t('title')}
            </Typography>
            <Typography variant="body-2" color="secondary">
              {t('subtitle')}
            </Typography>
          </Header>
          <NameContainer>
            <TextInput
              autoFocus
              {...register('name', {
                required: { value: true, message: t('form.errors.required') },
              })}
              label={t('form.name.label')}
              hasError={!!errors.name}
              placeholder={
                kind === Kind.KYC
                  ? t('form.name.placeholder-kyc')
                  : t('form.name.placeholder-kyb')
              }
            />
            {errors.name && (
              <Typography variant="body-3" color="error">
                {t('form.errors.required')}
              </Typography>
            )}
          </NameContainer>
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

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[5]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
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

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
    white-space: pre-wrap;
  `};
`;

export default NameYourPlaybook;
