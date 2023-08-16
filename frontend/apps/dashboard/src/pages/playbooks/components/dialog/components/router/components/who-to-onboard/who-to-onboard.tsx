import { useTranslation } from '@onefootprint/hooks';
import { IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, RadioSelect, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Kind } from '../../utils/machine/types';

export type WhoToOnboardProps = {
  onBack: () => void;
  onSubmit: (formData: FormData) => void;
  defaultKind?: Kind;
};

type FormData = {
  kind: Kind;
};

const WhoToOnboard = ({ onBack, onSubmit, defaultKind }: WhoToOnboardProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.who-to-onboard');
  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: { kind: defaultKind },
  });

  const submit = (data: FormData) => {
    onSubmit({ kind: data.kind });
  };

  return (
    <Container>
      <Header>
        <Typography variant="label-1">{t('title')}</Typography>
        <Typography variant="body-2">{t('subtitle')}</Typography>
      </Header>
      <Form onSubmit={handleSubmit(submit)}>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <RadioSelect
              options={[
                {
                  title: t('kyc.title'),
                  description: t('kyc.description'),
                  value: Kind.KYC,
                  IconComponent: IcoUsers24,
                },
                {
                  title: t('kyb.title'),
                  description: t('kyb.description'),
                  value: Kind.KYB,
                  IconComponent: IcoStore24,
                },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <ButtonContainer>
          <Button variant="secondary" size="compact" onClick={onBack}>
            {t('buttons.back')}
          </Button>
          <Button variant="primary" size="compact" type="submit">
            {t('buttons.continue')}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

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
    width: 520px;
    white-space: pre-wrap;
  `};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default WhoToOnboard;
