import { HeaderTitle } from 'footprint-ui';
import { useInputMask, useTranslation } from 'hooks';
import IcoFileText24 from 'icons/ico/ico-file-text-24';
import IcoLock24 from 'icons/ico/ico-lock-24';
import IcoShield24 from 'icons/ico/ico-shield-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, TextInput } from 'ui';

import ProgressHeader from '../../../../components/progress-header';
import Disclaimer from '../disclaimer';

type FormData = Required<Pick<UserData, UserDataAttribute.ssn>>;

type SsnLastFourProps = {
  isMutationLoading: boolean;
  onSubmit: (formData: FormData) => void;
};

const SSN = ({ isMutationLoading, onSubmit }: SsnLastFourProps) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('pages.onboarding.ssn.full');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <>
      <ProgressHeader />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <TextInput
          hasError={!!errors.ssn}
          hintText={errors.ssn && t('form.error')}
          label={t('form.label')}
          mask={inputMasks.ssn}
          placeholder={t('form.placeholder')}
          type="tel"
          {...register('ssn', {
            required: true,
            // Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
            // Numbers with 666 or 900–999 in the first digit group are not allowed.
            // Also validates length & formatting.
            pattern: /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/,
          })}
        />
        <Disclaimer
          items={[
            {
              title: t('disclaimer.security.title'),
              description: t('disclaimer.security.description'),
              Icon: IcoShield24,
            },
            {
              title: t('disclaimer.privacy.title'),
              description: t('disclaimer.privacy.description'),
              Icon: IcoLock24,
            },
            {
              title: t('disclaimer.credit-score.title'),
              description: t('disclaimer.credit-score.description'),
              Icon: IcoFileText24,
            },
          ]}
        />
        <Button type="submit" fullWidth loading={isMutationLoading}>
          {t('form.cta')}
        </Button>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default SSN;
