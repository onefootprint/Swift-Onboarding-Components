import { CollectedKycDataOption } from '@onefootprint/types';
import { Button, Checkbox, Radio, Stack, Text, Toggle } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { defaultFormValues } from '../../../../../utils/get-default-form-values';
import type { BoFormData } from '../../../bo-step.types';
import useMeta from '../hooks/use-meta';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person.form' });
  const { register, control, setValue } = useFormContext<BoFormData>();
  const { collectsBo, showNoPhoneFlow, hasSsnOptional, collectsSsn, hasUsTaxIdAcceptable } = useMeta();
  const data = useWatch({ control, name: 'data' });
  const [initialValues] = useState(() => {
    return data;
  });

  const handleSave = () => {
    onClose();
  };

  const handleCancel = () => {
    setValue('data', initialValues);
    onClose();
  };

  const handleSsnKindChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === CollectedKycDataOption.ssn4) {
      setValue('data.usTaxIdAcceptable', false);
    }
  };

  const handleUsTaxIdAcceptableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSsnOptional && event.target.checked) {
      setValue('data.ssn.optional', false);
    }
  };

  const handleReset = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('data', {
      ...defaultFormValues.boForm.data,
      collect: event.target.checked,
    });
    setValue('gov', defaultFormValues.boForm.gov);
    setValue('docs', defaultFormValues.boForm.docs);
  };

  const setSsnType = (nextValue: React.ChangeEvent<HTMLInputElement>) => {
    if (nextValue.target.checked) {
      setValue('data.ssn.kind', CollectedKycDataOption.ssn9);
    }
  };

  return (
    <Stack flexDirection="column" gap={8}>
      <Section>
        <Controller
          control={control}
          name={'data.collect'}
          render={({ field }) => (
            <Stack flexDirection="column" alignItems="flex-start">
              <Toggle
                onBlur={field.onBlur}
                onChange={event => {
                  handleReset(event);
                }}
                checked={field.value}
                label={t('collect-bo.label')}
              />
            </Stack>
          )}
        />
      </Section>
      {collectsBo ? (
        <>
          {showNoPhoneFlow && (
            <Section>
              <Text paddingBottom={2} variant="label-1">
                {t('basic-information.title')}
              </Text>
              <Text variant="label-3">{t('phone.title')}</Text>
              <Checkbox label={t('phone.label')} {...register('data.phoneNumber')} />
            </Section>
          )}
          <Section>
            <Text paddingBottom={3} variant="label-1">
              {t('us-residents.title')}
            </Text>
            <Text variant="label-3">{t('ssn.title')}</Text>
            <Checkbox label={t('ssn.label')} {...register('data.ssn.collect', { onChange: setSsnType })} />
            {collectsSsn && (
              <>
                <Subsection>
                  <OptionsContainer>
                    <Radio
                      label={t('ssn.full')}
                      value={CollectedKycDataOption.ssn9}
                      {...register('data.ssn.kind', {
                        onChange: handleSsnKindChange,
                      })}
                    />
                    <Radio
                      label={t('ssn.last4')}
                      value={CollectedKycDataOption.ssn4}
                      {...register('data.ssn.kind', {
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
                      {...register('data.usTaxIdAcceptable', {
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
                      {...register('data.ssn.optional')}
                    />
                  </Subsection>
                )}
              </>
            )}
          </Section>
          <Section>
            <Text variant="label-3">{t('us-legal-status.title')}</Text>
            <Checkbox label={t('us-legal-status.label')} {...register('data.usLegalStatus')} />
          </Section>
        </>
      ) : null}
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
