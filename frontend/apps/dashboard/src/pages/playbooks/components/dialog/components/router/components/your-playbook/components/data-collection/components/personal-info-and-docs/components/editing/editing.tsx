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

import type { PersonalInformationAndDocs } from '@/playbooks/utils/machine/types';
import { Kind } from '@/playbooks/utils/machine/types';

type EditingProps = {
  stopEditing: () => void;
  kind: Kind;
};

const Editing = ({ stopEditing, kind }: EditingProps) => {
  const { control, register, watch, setValue, getValues } = useFormContext();
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.form.personal-info-and-docs',
  );
  const {
    data: { user, org },
  } = useSession();
  const [unselectedIDDoc, setUnselectedIDDoc] = useState(false);
  const ssnOpen = watch('personalInformationAndDocs.ssn');
  const idDocOpen = watch('personalInformationAndDocs.idDoc');
  const idDocKind = watch('personalInformationAndDocs.idDocKind');
  const showNoPhoneFlow =
    (user?.isFirmEmployee || org?.name.toLowerCase().includes('findigs')) &&
    kind === Kind.KYC;

  // need to store this so we don't re-fetch on add'l renders
  const [initialValues] = useState<PersonalInformationAndDocs>({
    ...getValues('personalInformationAndDocs'),
  });

  const onSave = () => {
    if (idDocOpen && idDocKind?.length >= 1) {
      stopEditing();
    } else if (!idDocOpen) {
      stopEditing();
    } else {
      setUnselectedIDDoc(true);
    }
  };

  const onCancel = () => {
    setValue('personalInformationAndDocs', initialValues);
    stopEditing();
  };

  const title =
    kind === Kind.KYB ? (
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
            {t('basic-information')}
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
          {t('us-residents')}
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
                value={false}
                label={t('ssn-optional.checkbox')}
                {...register('personalInformationAndDocs.ssnOptional')}
              />
              <Typography
                color="tertiary"
                sx={{ paddingLeft: 7, marginLeft: 2 }}
                variant="body-3"
              >
                {t('ssn-optional.warning')}
              </Typography>
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
                  label={t('selfie.checkbox')}
                  {...register('personalInformationAndDocs.selfie')}
                />
                <Typography
                  color="tertiary"
                  sx={{ paddingLeft: 7, marginLeft: 2 }}
                  variant="body-3"
                >
                  {t('selfie.warning')}
                </Typography>
              </Subsection>
            )}
          </>
        )}
      </Section>
      <ButtonContainer>
        <Button variant="primary" fullWidth size="compact" onClick={onSave}>
          {t('save')}
        </Button>
        <Button variant="secondary" fullWidth size="compact" onClick={onCancel}>
          {t('cancel')}
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
