import { CollectedKycDataOption } from '@onefootprint/types';
import { Button, Checkbox, Radio, Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useMeta from '../../hooks/use-meta';
import type { KycPersonFormData } from '../../kyc-person.types';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.form' });
  const { register, control, setValue } = useFormContext<KycPersonFormData>();
  const { showNoPhoneFlow, hasSsnOptional, collectsSsn, hasUsTaxIdAcceptable } = useMeta();
  const data = useWatch({ control, name: 'person' });
  const [initialValues] = useState(() => {
    return data;
  });

  const handleSave = () => {
    onClose();
  };

  const handleCancel = () => {
    setValue('person', initialValues);
    onClose();
  };

  const handleSsnKindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === CollectedKycDataOption.ssn4) {
      setValue('person.usTaxIdAcceptable', false);
    }
  };

  const handleUsTaxIdAcceptableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSsnOptional && e.target.checked) {
      setValue('person.ssn.optional', false);
    }
  };

  const setSsnType = (nextValue: React.ChangeEvent<HTMLInputElement>) => {
    if (nextValue.target.checked) {
      setValue('person.ssn.kind', CollectedKycDataOption.ssn9);
    }
  };

  return (
    <Stack flexDirection="column" gap={8}>
      {showNoPhoneFlow && (
        <Section>
          <Text paddingBottom={2} variant="label-1">
            {t('basic-information.title')}
          </Text>
          <Text variant="label-3">{t('phone.title')}</Text>
          <Checkbox label={t('phone.label')} {...register('person.phoneNumber')} />
        </Section>
      )}
      <Section>
        <Text paddingBottom={3} variant="label-1">
          {t('us-residents.title')}
        </Text>
        <Text variant="label-3">{t('ssn.title')}</Text>
        <Checkbox label={t('ssn.label')} {...register('person.ssn.collect', { onChange: setSsnType })} />
        {collectsSsn && (
          <>
            <Subsection>
              <OptionsContainer>
                <Radio
                  label={t('ssn.full')}
                  value={CollectedKycDataOption.ssn9}
                  {...register('person.ssn.kind', {
                    onChange: handleSsnKindChange,
                  })}
                />
                <Radio
                  label={t('ssn.last4')}
                  value={CollectedKycDataOption.ssn4}
                  {...register('person.ssn.kind', {
                    onChange: handleSsnKindChange,
                  })}
                />
              </OptionsContainer>
            </Subsection>
            {data.ssn.kind === CollectedKycDataOption.ssn9 ? (
              <Subsection>
                <Checkbox
                  hint={t('accept-itin-hint')}
                  label={t('accept-itin-label')}
                  {...register('person.usTaxIdAcceptable', {
                    onChange: handleUsTaxIdAcceptableChange,
                  })}
                />
              </Subsection>
            ) : null}
            {hasUsTaxIdAcceptable ? null : (
              <Subsection>
                <Checkbox
                  hint={t('ssn-optional.hint')}
                  label={t('ssn-optional.label')}
                  {...register('person.ssn.optional')}
                />
              </Subsection>
            )}
          </>
        )}
      </Section>
      <Section>
        <Text variant="label-3">{t('us-legal-status.title')}</Text>
        <Checkbox label={t('us-legal-status.label')} {...register('person.usLegalStatus')} />
      </Section>
      <Stack flexDirection="column" gap={4}>
        <Button fullWidth variant="primary" onClick={handleSave}>
          {allT('save')}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleCancel}>
          {allT('cancel')}
        </Button>
      </Stack>
    </Stack>
  );
};

const Section = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const Subsection = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} ${theme.borderColor.tertiary} dashed;
    padding-top: ${theme.spacing[5]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default Form;
