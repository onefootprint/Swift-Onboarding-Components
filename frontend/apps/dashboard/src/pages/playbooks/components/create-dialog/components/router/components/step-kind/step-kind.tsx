import { IcoIdCard24, IcoShield24, IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import { Button, RadioSelect, Text } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';
import Header from '../header';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

export type StepKindProps = {
  onSubmit: (formData: FormData) => void;
  defaultKind?: PlaybookKind;
};

type FormData = {
  kind: PlaybookKind;
};

const StepKind = ({ onSubmit, defaultKind }: StepKindProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.who-to-onboard',
  });
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
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Form onSubmit={handleSubmit(submit)}>
        <Controller
          control={control}
          name="kind"
          defaultValue={PlaybookKind.Kyc}
          render={({ field }) => (
            <RadioSelect
              options={[
                {
                  label: t('onboard-title'),
                  options: [
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
                  ],
                },
                {
                  label: t('auth-title'),
                  options: [
                    {
                      title: t('auth.title'),
                      description: t('auth.description'),
                      value: PlaybookKind.Auth,
                      IconComponent: IcoShield24,
                      disabled: org?.isLive && org?.isProdAuthPlaybookRestricted,
                      disabledHint: t('auth.disabled-tooltip'),
                    },
                  ],
                },
                {
                  label: t('data-collection-title'),
                  options: [
                    {
                      title: t('doc-only.title'),
                      description: t('doc-only.description'),
                      value: PlaybookKind.DocOnly,
                      IconComponent: IcoIdCard24,
                      disabled: org?.isLive && org?.isProdKycPlaybookRestricted,
                      disabledHint: t('doc-only.disabled-tooltip'),
                    },
                  ],
                },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <ButtonContainer>
          <Button variant="primary" type="submit">
            {allT('next')}
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

export default StepKind;
