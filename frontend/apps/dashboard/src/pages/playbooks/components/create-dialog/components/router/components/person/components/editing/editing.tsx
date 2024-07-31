import { CollectedKybDataOption, CollectedKycDataOption } from '@onefootprint/types';
import { Button, Checkbox, Divider, Radio, Text, Toggle } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import { isKyb, isKyc } from 'src/pages/playbooks/utils/kind';
import styled, { css } from 'styled-components';

import type { DataToCollectMeta, Personal } from '@/playbooks/utils/machine/types';

type EditingProps = {
  onStopEditing: () => void;
};

const Editing = ({ onStopEditing }: EditingProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.person',
  });
  const { control, register, watch, setValue, getValues } = useFormContext();
  const {
    data: { user, org },
  } = useSession();
  const ssnOpen = watch('personal.ssn');
  const ssnKind = watch('personal.ssnKind');
  const isUsTaxIdAcceptable = !!watch('personal.usTaxIdAcceptable');
  const isSsnOptional = !!watch('personal.ssnOptional');
  const showNoPhoneFlow = user?.isFirmEmployee || org?.name.toLowerCase().includes('findigs');

  // need to store this so we don't re-fetch on add'l renders
  const [initialValues] = useState<Personal>({ ...getValues('personal') });

  const handleSave = () => {
    onStopEditing();
  };

  const handleCancel = () => {
    setValue('personal', initialValues);
    onStopEditing();
  };

  const resetSsnDocStepUp = () => setValue('personal.ssnDocScanStepUp', false);

  const handleSsnKindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === CollectedKycDataOption.ssn4) {
      setValue('personal.usTaxIdAcceptable', false);
    }
  };

  const handleUsTaxIdAcceptableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSsnOptional && e.target.checked) {
      setValue('personal.ssnOptional', false);
    }
  };

  const setSsnType = (nextValue: React.ChangeEvent<HTMLInputElement>) => {
    if (nextValue.target.checked && !ssnKind) {
      setValue('personal.ssnKind', CollectedKycDataOption.ssn9);
    }
  };

  const title = <Text variant="label-3">{t('editing.kyc')}</Text>;

  return (
    <EditingContainer>
      {showNoPhoneFlow && (
        <Section>
          <Text variant="label-3">{t('editing.kyc')}</Text>
          <Text paddingBottom={2} variant="label-1">
            {t('basic-information.title')}
          </Text>
          <Text variant="label-3">{t('phone.title')}</Text>
          <Controller
            control={control}
            name={`personal.${CollectedKycDataOption.phoneNumber}`}
            render={({ field }) => (
              <ToggleContainer>
                <Toggle
                  onBlur={field.onBlur}
                  onChange={nextValue => {
                    field.onChange(nextValue);
                  }}
                  checked={field.value}
                  label={t('phone.toggle')}
                />
              </ToggleContainer>
            )}
          />
        </Section>
      )}
      <Section>
        {!showNoPhoneFlow && title}
        <Text paddingBottom={3} variant="label-1">
          {t('us-residents.title')}
        </Text>
        <Text variant="label-3">{t('ssn.title')}</Text>
        <Controller
          control={control}
          name="personal.ssn"
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                  setSsnType(nextValue);
                }}
                checked={field.value}
                label={t('ssn.toggle')}
              />
            </ToggleContainer>
          )}
        />
        {ssnOpen && (
          <>
            <Subsection>
              <OptionsContainer>
                <Radio
                  label={t('ssn.full')}
                  value={CollectedKycDataOption.ssn9}
                  {...register('personal.ssnKind', { onChange: handleSsnKindChange })}
                />
                <Radio
                  label={t('ssn.last4')}
                  value={CollectedKycDataOption.ssn4}
                  {...register('personal.ssnKind', { onChange: handleSsnKindChange })}
                />
              </OptionsContainer>
            </Subsection>
            {ssnKind === CollectedKycDataOption.ssn9 ? (
              <Subsection>
                <Checkbox
                  hint={t('accept-itin-hint')}
                  label={t('accept-itin-label')}
                  {...register('personal.usTaxIdAcceptable', { onChange: handleUsTaxIdAcceptableChange })}
                />
              </Subsection>
            ) : null}
            {!isUsTaxIdAcceptable ? (
              <Subsection>
                <Checkbox
                  hint={t('ssn-optional.hint')}
                  label={t('ssn-optional.label')}
                  {...register('personal.ssnOptional', { onChange: resetSsnDocStepUp })}
                />
              </Subsection>
            ) : null}
          </>
        )}
      </Section>
      <Section>
        <Text variant="label-3">{t('us-legal-status.title')}</Text>
        <Checkbox
          label={t('us-legal-status.label')}
          {...register(`personal.${CollectedKycDataOption.usLegalStatus}`)}
        />
      </Section>
      <ButtonContainer>
        <Button fullWidth variant="primary" onClick={handleSave}>
          {allT('save')}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleCancel}>
          {allT('cancel')}
        </Button>
      </ButtonContainer>
    </EditingContainer>
  );
};

const Subsection = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} ${theme.borderColor.tertiary} dashed;
    padding-top: ${theme.spacing[5]};
  `}
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const ToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const EditingContainer = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
  `};
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

export default Editing;
