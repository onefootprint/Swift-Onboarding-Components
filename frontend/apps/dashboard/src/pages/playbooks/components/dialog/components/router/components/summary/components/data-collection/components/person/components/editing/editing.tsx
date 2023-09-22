import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Button, Checkbox, Radio, Toggle, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

import type {
  PersonalInformationAndDocs,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

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
  const ssnOpen = watch('personalInformationAndDocs.ssn');
  const idDocOpen = watch('personalInformationAndDocs.idDoc');
  const idDocKind = watch('personalInformationAndDocs.idDocKind');
  const showNoPhoneFlow =
    (user?.isFirmEmployee || org?.name.toLowerCase().includes('findigs')) &&
    kind === PlaybookKind.Kyc;

  // need to store this so we don't re-fetch on add'l renders
  const [initialValues] = useState<PersonalInformationAndDocs>({
    ...getValues('personalInformationAndDocs'),
  });

  const handleSave = () => {
    if (idDocOpen && idDocKind?.length >= 1) {
      onStopEditing();
    } else if (!idDocOpen) {
      onStopEditing();
    } else {
      setUnselectedIDDoc(true);
    }
  };

  const handleCancel = () => {
    setValue('personalInformationAndDocs', initialValues);
    onStopEditing();
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
            name={`personalInformationAndDocs.${CollectedKycDataOption.phoneNumber}`}
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
          name="personalInformationAndDocs.ssn"
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                }}
                checked={field.value}
                label={t('ssn.toggle')}
                labelPlacement="right"
              />
            </ToggleContainer>
          )}
        />
        {ssnOpen && (
          <>
            <Subsection>
              <OptionsContainer>
                <Radio
                  value={CollectedKycDataOption.ssn9}
                  label={t('ssn.full')}
                  {...register('personalInformationAndDocs.ssnKind')}
                />
                <Radio
                  value={CollectedKycDataOption.ssn4}
                  label={t('ssn.last4')}
                  {...register('personalInformationAndDocs.ssnKind')}
                />
              </OptionsContainer>
            </Subsection>
            <Subsection>
              <Checkbox
                label={t('ssn-optional.label')}
                hint={t('ssn-optional.hint')}
                {...register('personalInformationAndDocs.ssnOptional')}
              />
              <SsnDocStepUp>
                <Checkbox
                  label={t('ssn-doc-scan-step-up.label')}
                  hint={t('ssn-doc-scan-step-up.hint')}
                  {...register('personalInformationAndDocs.ssnDocScanStepUp')}
                />
              </SsnDocStepUp>
            </Subsection>
          </>
        )}
      </Section>
      <Section>
        <Typography variant="label-3">{t('us-legal-status.title')}</Typography>
        <Controller
          control={control}
          name={`personalInformationAndDocs.${CollectedKycDataOption.usLegalStatus}`}
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                }}
                defaultChecked={false}
                checked={field.value}
                label={t('us-legal-status.toggle')}
                labelPlacement="right"
              />
            </ToggleContainer>
          )}
        />
      </Section>
      <Section>
        <Typography variant="label-3">{t('id-doc.title')}</Typography>
        <Controller
          control={control}
          name="personalInformationAndDocs.idDoc"
          render={({ field }) => (
            <ToggleContainer>
              <Toggle
                onBlur={field.onBlur}
                onChange={nextValue => {
                  field.onChange(nextValue);
                }}
                checked={field.value}
                label={t('id-doc.toggle')}
                labelPlacement="right"
              />
            </ToggleContainer>
          )}
        />
        {idDocOpen && (
          <>
            <Subsection>
              <OptionsContainer>
                <Checkbox
                  value={SupportedIdDocTypes.driversLicense}
                  label={t('id-doc.drivers_license')}
                  {...register('personalInformationAndDocs.idDocKind')}
                />
                <Checkbox
                  value={SupportedIdDocTypes.idCard}
                  label={t('id-doc.id_card')}
                  {...register('personalInformationAndDocs.idDocKind')}
                />
                <Checkbox
                  value={SupportedIdDocTypes.passport}
                  label={t('id-doc.passport')}
                  {...register('personalInformationAndDocs.idDocKind')}
                />
                <Checkbox
                  value={SupportedIdDocTypes.visa}
                  label={t('id-doc.visa')}
                  {...register('personalInformationAndDocs.idDocKind')}
                />
                <Checkbox
                  value={SupportedIdDocTypes.residenceDocument}
                  label={t('id-doc.residence_document')}
                  {...register('personalInformationAndDocs.idDocKind')}
                />
                <Checkbox
                  value={SupportedIdDocTypes.workPermit}
                  label={t('id-doc.work_permit')}
                  {...register('personalInformationAndDocs.idDocKind')}
                />
                {(!idDocKind || idDocKind.length === 0) && unselectedIDDoc && (
                  <Typography
                    color="error"
                    variant="body-3"
                    sx={{ paddingTop: 5 }}
                  >
                    {t('id-doc.no-id-doc-selected')}
                  </Typography>
                )}
              </OptionsContainer>
            </Subsection>
            {idDocKind?.length > 0 && (
              <Subsection>
                <Checkbox
                  value={false}
                  label={t('selfie.label')}
                  hint={t('selfie.hint')}
                  {...register('personalInformationAndDocs.selfie')}
                />
              </Subsection>
            )}
          </>
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

const SsnDocStepUp = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]};
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
