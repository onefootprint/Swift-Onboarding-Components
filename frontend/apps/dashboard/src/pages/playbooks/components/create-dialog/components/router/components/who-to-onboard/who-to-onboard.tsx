import { IcoIdCard24, IcoShield24, IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import { Button, RadioSelect, Text } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

export type WhoToOnboardProps = {
  onSubmit: (formData: FormData) => void;
  defaultKind?: PlaybookKind;
};

type FormData = {
  kind: PlaybookKind;
};

const WhoToOnboard = ({ onSubmit, defaultKind }: WhoToOnboardProps) => {
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
      <Header>
        <Text variant="label-1" color="secondary">
          {t('title')}
        </Text>
        <Text variant="body-2" color="secondary">
          {t('subtitle')}
        </Text>
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
                      title: t('id-doc.title'),
                      description: t('id-doc.description'),
                      value: PlaybookKind.IdDoc,
                      IconComponent: IcoIdCard24,
                      disabled: org?.isLive && org?.isProdKycPlaybookRestricted,
                      disabledHint: t('id-doc.disabled-tooltip'),
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
