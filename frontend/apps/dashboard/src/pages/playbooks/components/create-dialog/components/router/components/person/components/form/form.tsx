import { type DataToCollectFormData, type DataToCollectMeta } from '@/playbooks/utils/machine/types';
import { CollectedKycDataOption } from '@onefootprint/types';
import { Button, Checkbox, Radio, Stack, Text, Toggle } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isKyb, isKyc } from 'src/pages/playbooks/utils/kind';
import styled, { css } from 'styled-components';

import usePersonValues from '../../hooks/use-person-values';

type FormProps = {
  meta: DataToCollectMeta;
  onClose: () => void;
};

const Form = ({ onClose, meta: { kind } }: FormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.person.form',
  });
  const { control, register, setValue } = useFormContext<DataToCollectFormData>();
  const { basic, meta } = usePersonValues();
  const [initialValues] = useState(() => {
    return basic;
  });

  const handleSave = () => {
    onClose();
  };

  const handleCancel = () => {
    setValue('person.basic', initialValues);
    onClose();
  };

  const handleSsnKindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === CollectedKycDataOption.ssn4) {
      setValue('person.basic.usTaxIdAcceptable', false);
    }
  };

  const handleUsTaxIdAcceptableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (meta.hasSsnOptional && e.target.checked) {
      setValue('person.basic.ssn.optional', false);
    }
  };

  const setSsnType = (nextValue: React.ChangeEvent<HTMLInputElement>) => {
    if (nextValue.target.checked) {
      setValue('person.basic.ssn.kind', CollectedKycDataOption.ssn9);
    }
  };

  return (
    <Stack flexDirection="column" gap={8}>
      {isKyb(kind) && (
        <Section>
          <Controller
            control={control}
            name={'business.basic.collectBOInfo'}
            render={({ field }) => (
              <Stack flexDirection="column" alignItems="flex-start">
                <Toggle
                  onBlur={field.onBlur}
                  onChange={nextValue => {
                    field.onChange(nextValue);
                  }}
                  checked={field.value}
                  label={t('collect-bo.label')}
                />
              </Stack>
            )}
          />
        </Section>
      )}
      {isKyc(kind) || meta.collectsBOInfo ? (
        <>
          {meta.showNoPhoneFlow && (
            <Section>
              <Text paddingBottom={2} variant="label-1">
                {t('basic-information.title')}
              </Text>
              <Text variant="label-3">{t('phone.title')}</Text>
              <Checkbox label={t('phone.label')} {...register('person.basic.phoneNumber')} />
            </Section>
          )}
          <Section>
            <Text paddingBottom={3} variant="label-1">
              {t('us-residents.title')}
            </Text>
            <Text variant="label-3">{t('ssn.title')}</Text>
            <Checkbox label={t('ssn.label')} {...register('person.basic.ssn.collect', { onChange: setSsnType })} />
            {meta.collectsSsn && (
              <>
                <Subsection>
                  <OptionsContainer>
                    <Radio
                      label={t('ssn.full')}
                      value={CollectedKycDataOption.ssn9}
                      {...register('person.basic.ssn.kind', {
                        onChange: handleSsnKindChange,
                      })}
                    />
                    <Radio
                      label={t('ssn.last4')}
                      value={CollectedKycDataOption.ssn4}
                      {...register('person.basic.ssn.kind', {
                        onChange: handleSsnKindChange,
                      })}
                    />
                  </OptionsContainer>
                </Subsection>
                {basic.ssn.kind === CollectedKycDataOption.ssn9 ? (
                  <Subsection>
                    <Checkbox
                      hint={t('accept-itin-hint')}
                      label={t('accept-itin-label')}
                      {...register('person.basic.usTaxIdAcceptable', {
                        onChange: handleUsTaxIdAcceptableChange,
                      })}
                    />
                  </Subsection>
                ) : null}
                {meta.hasUsTaxIdAcceptable ? null : (
                  <Subsection>
                    <Checkbox
                      hint={t('ssn-optional.hint')}
                      label={t('ssn-optional.label')}
                      {...register('person.basic.ssn.optional')}
                    />
                  </Subsection>
                )}
              </>
            )}
          </Section>
          <Section>
            <Text variant="label-3">{t('us-legal-status.title')}</Text>
            <Checkbox label={t('us-legal-status.label')} {...register('person.basic.usLegalStatus')} />
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
