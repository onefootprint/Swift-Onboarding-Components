import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CollectedKycDataOption } from '@onefootprint/types';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Radio,
  Toggle,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

import type { Personal, SummaryMeta } from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

import IdDocPicker from './components/id-doc-picker';

type EditingProps = {
  onStopEditing: () => void;
  meta: SummaryMeta;
};

const Editing = ({ onStopEditing, meta }: EditingProps) => {
  const { control, register, watch, setValue, getValues } = useFormContext();
  const { t, allT } = useTranslation('pages.playbooks.dialog.summary.person');
  const { kind } = meta;
  const {
    data: { user, org },
  } = useSession();
  const [unselectedIDDoc, setUnselectedIDDoc] = useState(false);
  const ssnOpen = watch('personal.ssn');
  const shouldCollectIdDoc = watch('personal.idDoc');
  const idDocKind = watch('personal.idDocKind');
  const isSsnOptional = !!watch('personal.ssnOptional');
  const shouldStepUpIdDoc = !!watch('personal.ssnDocScanStepUp');

  const showNoPhoneFlow =
    (user?.isFirmEmployee || org?.name.toLowerCase().includes('findigs')) &&
    kind === PlaybookKind.Kyc;
  const showSsnDocStepUp = isSsnOptional;

  // need to store this so we don't re-fetch on add'l renders
  const [initialValues] = useState<Personal>({
    ...getValues('personal'),
  });

  const handleSave = () => {
    if (shouldCollectIdDoc && idDocKind?.length >= 1) {
      onStopEditing();
    } else if (!shouldCollectIdDoc) {
      onStopEditing();
    } else {
      setUnselectedIDDoc(true);
    }
  };

  const handleCancel = () => {
    setValue('personal', initialValues);
    onStopEditing();
  };

  const resetSsnDocStepUp = () => {
    setValue('personal.ssnDocScanStepUp', false);
  };

  const resetDocs = () => {
    setValue('personal.idDocKind', []);
  };

  const title =
    kind === PlaybookKind.Kyb ? (
      <Typography variant="label-3">{t('editing.kyb')}</Typography>
    ) : (
      <Typography variant="label-3">{t('editing.kyc')}</Typography>
    );

  return (
    <EditingContainer>
      {showNoPhoneFlow && (
        <Section>
          {title}
          <Typography sx={{ paddingBottom: 2 }} variant="label-1">
            {t('basic-information.title')}
          </Typography>
          <Typography variant="label-3">{t('phone.title')}</Typography>
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
                  labelPlacement="right"
                />
              </ToggleContainer>
            )}
          />
        </Section>
      )}
      <Section>
        {!showNoPhoneFlow && title}
        <Typography sx={{ paddingBottom: 3 }} variant="label-1">
          {t('us-residents.title')}
        </Typography>
        <Typography variant="label-3">{t('ssn.title')}</Typography>
        <Controller
          control={control}
          name="personal.ssn"
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                  resetSsnDocStepUp();
                  resetDocs();
                }}
                checked={field.value}
                label={t('ssn.toggle')}
                labelPlacement="right"
              />
            </ToggleContainer>
          )}
        />
        {ssnOpen ? (
          <>
            <Subsection>
              <OptionsContainer>
                <Radio
                  label={t('ssn.full')}
                  value={CollectedKycDataOption.ssn9}
                  {...register('personal.ssnKind')}
                />
                <Radio
                  label={t('ssn.last4')}
                  value={CollectedKycDataOption.ssn4}
                  {...register('personal.ssnKind')}
                />
              </OptionsContainer>
            </Subsection>
            <Subsection>
              <Checkbox
                hint={t('ssn-optional.hint')}
                label={t('ssn-optional.label')}
                {...register('personal.ssnOptional', {
                  onChange: () => {
                    resetSsnDocStepUp();
                    resetDocs();
                  },
                })}
              />
              {showSsnDocStepUp && (
                <LeftSpacing>
                  <Box sx={{ marginY: 5 }}>
                    <Divider variant="secondary" />
                  </Box>
                  <Checkbox
                    hint={t('ssn-doc-scan-step-up.hint')}
                    label={t('ssn-doc-scan-step-up.label')}
                    disabled={shouldCollectIdDoc}
                    {...register('personal.ssnDocScanStepUp', {
                      onChange: () => {
                        resetDocs();
                      },
                    })}
                  />
                  {shouldStepUpIdDoc && (
                    <Box>
                      <Box sx={{ marginY: 5 }}>
                        <Divider variant="secondary" />
                      </Box>
                      <IdDocPicker unselectedIDDoc={unselectedIDDoc} />
                    </Box>
                  )}
                </LeftSpacing>
              )}
            </Subsection>
          </>
        ) : (
          <>
            <Subsection>
              <Checkbox
                hint={t('ssn-doc-scan-step-up.hint')}
                label={t('ssn-doc-scan-step-up.label')}
                {...register('personal.ssnDocScanStepUp', {
                  onChange: () => {
                    resetDocs();
                  },
                })}
              />
            </Subsection>
            {shouldStepUpIdDoc && (
              <LeftSpacing>
                <Box sx={{ marginY: 5 }}>
                  <Divider variant="secondary" />
                </Box>
                <IdDocPicker unselectedIDDoc={unselectedIDDoc} />
              </LeftSpacing>
            )}
          </>
        )}
      </Section>
      <Section>
        <Typography variant="label-3">{t('us-legal-status.title')}</Typography>
        <Checkbox
          label={t('us-legal-status.label')}
          {...register(`personal.${CollectedKycDataOption.usLegalStatus}`)}
        />
      </Section>
      <Section>
        <Typography variant="label-3">{t('id-doc.title')}</Typography>
        <Controller
          control={control}
          name="personal.idDoc"
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                checked={field.value}
                disabled={shouldStepUpIdDoc}
                label={t('id-doc.toggle')}
                labelPlacement="right"
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
            <Box sx={{ marginBottom: 5 }}>
              <Divider variant="secondary" />
            </Box>
            <IdDocPicker unselectedIDDoc={unselectedIDDoc} />
          </Box>
        )}
      </Section>
      <ButtonContainer>
        <Button fullWidth size="compact" variant="primary" onClick={handleSave}>
          {allT('save')}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          size="compact"
          onClick={handleCancel}
        >
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

const LeftSpacing = styled.div`
  ${({ theme }) => css`
    margin-left: calc(${theme.spacing[7]} + ${theme.spacing[2]});
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
