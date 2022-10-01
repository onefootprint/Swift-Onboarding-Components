import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { IcoFileText24, IcoLock24, IcoShield24 } from '@onefootprint/icons';
import { Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../../components/header-title';
import InfoBox from '../../../../../../components/info-box';
import NavigationHeader from '../../../../components/navigation-header';
import { SSN9Information } from '../../../../utils/state-machine/types';

type FormData = SSN9Information;

type SSN9Props = {
  isMutationLoading: boolean;
  onSubmit: (formData: FormData) => void;
};

const SSN9 = ({ isMutationLoading, onSubmit }: SSN9Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('pages.ssn.full');
  const { t: cta } = useTranslation('pages.cta');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <>
      <NavigationHeader />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <TextInput
          hasError={!!errors.ssn9}
          hint={errors.ssn9 && t('form.error')}
          label={t('form.label')}
          mask={inputMasks.ssn}
          placeholder={t('form.placeholder')}
          type="tel"
          {...register('ssn9', {
            required: true,
            // Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
            // Numbers with 666 or 900–999 in the first digit group are not allowed.
            // Also validates length & formatting.
            pattern: /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/,
          })}
        />
        <InfoBox
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
          {cta('complete')}
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

export default SSN9;
