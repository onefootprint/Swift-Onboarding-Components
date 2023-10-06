import { useTranslation } from '@onefootprint/hooks';
import { IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, RadioSelect, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

export type WhoToOnboardProps = {
  onSubmit: (formData: FormData) => void;
  defaultKind?: PlaybookKind;
};

type FormData = {
  kind: PlaybookKind;
};

const WhoToOnboard = ({ onSubmit, defaultKind }: WhoToOnboardProps) => {
  const { t, allT } = useTranslation('pages.playbooks.dialog.who-to-onboard');
  const {
    data: { org },
  } = useSession();
  const kind = PlaybookKind.Unknown ? PlaybookKind.Kyc : defaultKind;
  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: { kind },
  });

  const submit = (data: FormData) => {
    onSubmit({ kind: data.kind });
  };

  return (
    <Container>
      <Header>
        <Typography variant="label-1" color="secondary">
          {t('title')}
        </Typography>
        <Typography variant="body-2" color="secondary">
          {t('subtitle')}
        </Typography>
      </Header>
      <Form onSubmit={handleSubmit(submit)}>
        <Controller
          control={control}
          name="kind"
          defaultValue={PlaybookKind.Kyc}
          render={({ field }) => (
            <RadioSelect
              options={[
                {
                  title: t('kyc.title'),
                  description: t('kyc.description'),
                  value: PlaybookKind.Kyc,
                  IconComponent: IcoUsers24,
                  disabled: org?.isLive && org?.isProdKycPlaybookRestricted,
                  disabledHint: t('kyc.disabled-tooltip'),
                },
                {
                  title: t('kyb.title'),
                  description: t('kyb.description'),
                  value: PlaybookKind.Kyb,
                  IconComponent: IcoStore24,
                  disabled: org?.isLive && org?.isProdKybPlaybookRestricted,
                  disabledHint: t('kyb.disabled-tooltip'),
                },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <ButtonContainer>
          <Button variant="primary" size="compact" type="submit">
            {allT('next')}
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

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default WhoToOnboard;
