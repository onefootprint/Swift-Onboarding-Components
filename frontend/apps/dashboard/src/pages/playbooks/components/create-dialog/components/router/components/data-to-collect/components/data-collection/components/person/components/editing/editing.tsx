import { CollectedKybDataOption, CollectedKycDataOption } from '@onefootprint/types';
import { Box, Button, Checkbox, Divider, Radio, Text, Toggle } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import type { DataToCollectMeta, Personal } from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

import Document from '../../../document';

type EditingProps = {
  onStopEditing: () => void;
  meta: DataToCollectMeta;
};

const Editing = ({ onStopEditing, meta }: EditingProps) => {
  const { control, register, watch, setValue, getValues } = useFormContext();
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.person',
  });
  const { kind } = meta;
  const {
    data: { user, org },
  } = useSession();
  const ssnOpen = watch('personal.ssn');
  const ssnKind = watch('personal.ssnKind');
  const shouldCollectIdDoc = watch('personal.idDoc');
  const selectedGlobalDocs = watch('personal.idDocKind');
  const selectedCountrySpecificDocs = watch('personal.countrySpecificIdDocKind');
  const collectBO = !!watch(`businessInformation.${CollectedKybDataOption.beneficialOwners}`);
  const isKyb = kind === PlaybookKind.Kyb;

  const showNoPhoneFlow =
    (user?.isFirmEmployee || org?.name.toLowerCase().includes('findigs')) && kind === PlaybookKind.Kyc;

  // need to store this so we don't re-fetch on add'l renders
  const [initialValues] = useState<Personal>({
    ...getValues('personal'),
  });

  const handleSave = () => {
    if (
      shouldCollectIdDoc &&
      (selectedGlobalDocs?.length >= 1 || Object.keys(selectedCountrySpecificDocs).length >= 1)
    ) {
      onStopEditing();
    } else if (!shouldCollectIdDoc) {
      onStopEditing();
    }
  };

  const handleCancel = () => {
    setValue('personal', initialValues);
    onStopEditing();
  };

  const setSsnType = (nextValue: React.ChangeEvent<HTMLInputElement>) => {
    if (nextValue.target.checked && !ssnKind) {
      setValue('personal.ssnKind', CollectedKycDataOption.ssn9);
    }
  };

  const resetDocs = () => {
    setValue('personal.idDocKind', []);
    setValue('personal.countrySpecificIdDocKind', {});
  };

  const title = isKyb ? (
    <Text variant="label-3">{t('editing.kyb')}</Text>
  ) : (
    <Text variant="label-3">{t('editing.kyc')}</Text>
  );

  const isSaveDisabled = () => {
    if (
      shouldCollectIdDoc &&
      selectedGlobalDocs.length === 0 &&
      Object.keys(selectedCountrySpecificDocs).length === 0
    ) {
      return true;
    }
    return false;
  };

  if (isKyb && !collectBO) {
    return (
      <EditingContainer>
        <Section>
          {title}
          <Controller
            control={control}
            name={`businessInformation.${CollectedKybDataOption.beneficialOwners}`}
            render={({ field }) => (
              <ToggleContainer>
                <Toggle
                  onBlur={field.onBlur}
                  onChange={nextValue => {
                    field.onChange(nextValue);
                  }}
                  checked={field.value}
                  label={t('beneficial-owner-collect.toggle')}
                />
              </ToggleContainer>
            )}
          />
        </Section>
        <ButtonContainer>
          <Button fullWidth variant="primary" onClick={handleSave} disabled={isSaveDisabled()}>
            {allT('save')}
          </Button>
          <Button variant="secondary" fullWidth onClick={handleCancel}>
            {allT('cancel')}
          </Button>
        </ButtonContainer>
      </EditingContainer>
    );
  }

  return (
    <EditingContainer>
      {isKyb && (
        <Section>
          {title}
          <Controller
            control={control}
            name={`businessInformation.${CollectedKybDataOption.beneficialOwners}`}
            render={({ field }) => (
              <ToggleContainer>
                <Toggle
                  onBlur={field.onBlur}
                  onChange={nextValue => {
                    field.onChange(nextValue);
                  }}
                  checked={field.value}
                  label={t('beneficial-owner-collect.toggle')}
                />
              </ToggleContainer>
            )}
          />
        </Section>
      )}
      {showNoPhoneFlow && (
        <Section>
          {!isKyb && title}
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
        {!isKyb && !showNoPhoneFlow && title}
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
                <Radio label={t('ssn.full')} value={CollectedKycDataOption.ssn9} {...register('personal.ssnKind')} />
                <Radio label={t('ssn.last4')} value={CollectedKycDataOption.ssn4} {...register('personal.ssnKind')} />
              </OptionsContainer>
            </Subsection>
            <Subsection>
              <Checkbox
                hint={t('ssn-optional.hint')}
                label={t('ssn-optional.label')}
                {...register('personal.ssnOptional')}
              />
            </Subsection>
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
      <Section>
        <Text variant="label-3">{t('id-doc.title')}</Text>
        <Controller
          control={control}
          name="personal.idDoc"
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                checked={field.value}
                label={t('id-doc.toggle')}
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                  resetDocs();
                }}
              />
            </ToggleContainer>
          )}
        />
        {shouldCollectIdDoc && (
          <Box>
            <Box marginBottom={5}>
              <Divider variant="secondary" />
            </Box>
            <Document />
          </Box>
        )}
      </Section>
      <ButtonContainer>
        <Button fullWidth variant="primary" onClick={handleSave} disabled={isSaveDisabled()}>
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
