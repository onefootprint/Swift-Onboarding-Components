import { Button, Text, TextInput } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import type { NameFormData } from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

import getPlaceholder from './utils/get-placeholder';

type NameYourPlaybookProps = {
  kind?: PlaybookKind;
  onSubmit: (data: NameFormData) => void;
  onBack: () => void;
  defaultValues: NameFormData;
};

const NameYourPlaybook = ({ kind = PlaybookKind.Kyc, onSubmit, onBack, defaultValues }: NameYourPlaybookProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.name-your-playbook',
  });
  const formMethods = useForm<NameFormData>({
    defaultValues,
  });
  const { data } = useSession();
  const { org } = data;

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = formMethods;
  useEffect(() => {
    setValue('kind', kind);
  }, [setValue, kind]);

  const kindString = t(kind as unknown as ParseKeys<'common'>) as unknown as string;
  const placeholder = getPlaceholder({
    tenantName: org?.name || '',
    kindString,
  });

  return (
    <Container>
      <FormProvider {...formMethods}>
        <Form id="your-playbook-form" onSubmit={handleSubmit(onSubmit)}>
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
              {...register('name', {
                required: { value: true, message: t('form.errors.required') },
              })}
              label={t('form.name.label')}
              hasError={!!errors.name}
              placeholder={placeholder}
            />
            {errors.name && (
              <Text variant="body-3" color="error">
                {t('form.errors.required')}
              </Text>
            )}
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
